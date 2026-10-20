import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Search, UserPlus } from 'lucide-react'
import { listarPacientes } from '../../../lib/perfisApi'
import { listarConsultas, situarConsultas } from '../../../lib/consultasApi'
import { carregarAcompanhamento } from '../../../lib/acompanhamento'
import { formatarImc } from '../../../lib/imc'
import { diasEntre, formatarDia, formatarQuando, hojeISO } from '../../../lib/datas'
import { BotaoLink } from '../../../components/Botao'
import Sinal from '../../../components/Sinal'

const PERIODO = 30
const PRIORIDADE = { grave: 0, atencao: 1, pendente: 2, informativo: 3 }
// Todos = quem está em acompanhamento (ativos e suspensos); encerrados ficam à parte.
// Inativo = ativo, já fez o primeiro acesso e está há 7 dias ou mais sem registrar nada (DIAS_PARA_INATIVO).
const FILTROS = [
  { valor: 'todos', rotulo: 'Todos', mostra: (l) => l.perfil.situacao !== 'encerrado' },
  {
    valor: 'atencao',
    rotulo: 'Com sinais de atenção',
    mostra: (l) => l.perfil.situacao === 'ativo' && l.sinais.some((s) => s.tipo === 'grave' || s.tipo === 'atencao'),
  },
  { valor: 'inativos', rotulo: 'Inativos', mostra: (l) => l.perfil.situacao === 'ativo' && l.consentiu && l.resumo.inativo },
  { valor: 'encerrados', rotulo: 'Encerrados', mostra: (l) => l.perfil.situacao === 'encerrado' },
]

const DIAS_AGENDA = 7

const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Lista de pacientes da cardiologista, com quem tem sinais de atenção primeiro.
export default function Pacientes() {
  const [linhas, setLinhas] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    Promise.all([listarPacientes(), listarConsultas()])
      .then(([pacientes, consultas]) =>
        Promise.all(
          pacientes.map(async (p) => ({
            perfil: p,
            consulta: situarConsultas(consultas.filter((c) => c.userId === p.id)),
            ...(await carregarAcompanhamento(p, PERIODO)),
          })),
        ),
      )
      .then(setLinhas)
  }, [])

  const visiveis = (linhas ?? [])
    .filter((l) => semAcento(l.perfil.nome).includes(semAcento(busca)))
    .filter(FILTROS.find((f) => f.valor === filtro).mostra)
    .sort((a, b) => {
      const pa = Math.min(4, ...a.sinais.map((s) => PRIORIDADE[s.tipo]))
      const pb = Math.min(4, ...b.sinais.map((s) => PRIORIDADE[s.tipo]))
      return pa - pb || a.perfil.nome.localeCompare(b.perfil.nome, 'pt-BR')
    })

  // Consultas dos próximos dias, para a médica chegar preparada.
  const agenda = (linhas ?? [])
    .filter((l) => l.perfil.situacao !== 'encerrado' && l.consulta.proxima && diasEntre(hojeISO(), l.consulta.proxima.inicio.slice(0, 10)) < DIAS_AGENDA)
    .sort((a, b) => a.consulta.proxima.inicio.localeCompare(b.consulta.proxima.inicio))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-interface text-[11px] font-semibold uppercase tracking-[0.2em] text-carmim">LOF Heart · Visão profissional</p>
          <h1 className="mt-2 text-3xl font-semibold">Pacientes</h1>
          <p className="mt-1 text-sm text-textoSecundario">Sinais calculados sobre os últimos {PERIODO} dias. Destacam o que conferir — não são diagnóstico.</p>
        </div>
        <BotaoLink to="/app/admin/pacientes/novo">
          <UserPlus size={16} aria-hidden /> Novo paciente
        </BotaoLink>
      </div>

      {agenda.length > 0 && (
        <section className="rounded-3xl bg-branco p-5 shadow-cartao">
          <h2 className="mb-3 flex items-center gap-2 font-interface text-xs font-semibold uppercase tracking-[0.15em] text-carmim">
            <CalendarDays size={15} aria-hidden /> Consultas nos próximos {DIAS_AGENDA} dias
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agenda.map(({ perfil, consulta, sinais }) => {
              const destaques = sinais.filter((s) => s.tipo === 'grave' || s.tipo === 'atencao')
              return (
                <Link
                  key={perfil.id}
                  to={`/app/admin/pacientes/${perfil.id}`}
                  className="rounded-2xl border border-borda p-4 transition-colors hover:border-carmim"
                >
                  <p className="font-interface text-sm font-semibold">{perfil.nome}</p>
                  <p className="text-sm text-textoSecundario first-letter:uppercase">{formatarQuando(consulta.proxima.inicio)}</p>
                  <div className="mt-2">
                    {destaques.length > 0 ? (
                      <Sinal tipo={destaques.some((s) => s.tipo === 'grave') ? 'grave' : 'atencao'}>
                        {destaques.length === 1 ? '1 sinal para ver na Síntese' : `${destaques.length} sinais para ver na Síntese`}
                      </Sinal>
                    ) : (
                      <Sinal tipo="pendente">Síntese pronta, sem sinais</Sinal>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textoSecundario" aria-hidden />
          <span className="sr-only">Buscar paciente</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full rounded-full border border-borda bg-branco py-2.5 pl-10 pr-4 text-sm focus:border-carmim"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              aria-pressed={filtro === f.valor}
              className={`rounded-full px-3.5 py-2 font-interface text-xs font-semibold ${
                filtro === f.valor ? 'bg-noite text-branco' : 'bg-branco text-textoSecundario hover:text-texto'
              }`}
            >
              {f.rotulo}
              {linhas && <span className="ml-1.5 opacity-70">{linhas.filter(f.mostra).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-branco shadow-cartao">
        {!linhas && <p className="p-6 text-textoSecundario">Carregando…</p>}
        {linhas && visiveis.length === 0 && <p className="p-6 text-textoSecundario">Nenhum paciente aqui.</p>}
        <ul className="divide-y divide-borda">
          {visiveis.map(({ perfil, resumo, sinais, consulta }) => (
            <li key={perfil.id}>
              <Link to={`/app/admin/pacientes/${perfil.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-papel">
                <div className="min-w-0 flex-1">
                  <p className="font-interface font-semibold">
                    {perfil.nome}
                    <span className="ml-2 font-corpo text-sm font-normal text-textoSecundario">
                      {resumo.idade !== null && `${resumo.idade} anos`}
                      {resumo.imc && ` · IMC ${formatarImc(resumo.imc.valor)}`}
                    </span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {sinais.map((s) => <Sinal key={s.texto} tipo={s.tipo}>{s.texto}</Sinal>)}
                    {perfil.situacao !== 'ativo' && <Sinal tipo="pendente">{perfil.situacao === 'suspenso' ? 'Suspenso' : 'Encerrado'}</Sinal>}
                  </div>
                </div>
                <div className="hidden text-right text-sm sm:block">
                  {resumo.ultimaPressao && (
                    <p className="font-titulo font-semibold">
                      {resumo.ultimaPressao.sistolica}/{resumo.ultimaPressao.diastolica} <span className="text-xs font-medium text-textoSecundario">mmHg</span>
                    </p>
                  )}
                  <p className="text-xs text-textoSecundario">
                    {resumo.ultimoRegistro ? `Último registro em ${formatarDia(resumo.ultimoRegistro)}` : 'Sem registros'}
                  </p>
                  {consulta.proxima && perfil.situacao !== 'encerrado' && (
                    <p className="text-xs text-textoSecundario">Consulta {formatarQuando(consulta.proxima.inicio)}</p>
                  )}
                </div>
                <ChevronRight size={18} className="shrink-0 text-textoSecundario" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
