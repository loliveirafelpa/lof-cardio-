import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { buscarPerfil } from '../../../lib/perfisApi'
import { listarConsultas, situarConsultas } from '../../../lib/consultasApi'
import { carregarAcompanhamento } from '../../../lib/acompanhamento'
import { formatarImc } from '../../../lib/imc'
import { diasEntre, formatarDia, formatarNumero, formatarQuando, hojeISO } from '../../../lib/datas'
import Abas from '../../../components/Abas'
import Sinal from '../../../components/Sinal'
import VisaoGeral from './VisaoGeral'
import Sintese from './Sintese'
import Configuracao from './Configuracao'
import Consultas from './Consultas'
import Medicamentos from './Medicamentos'
import Exames from './Exames'
import PerfilEPeso from './PerfilEPeso'

// 'consulta' = desde a última consulta realizada (padrão quando existe uma).
const PERIODOS = ['consulta', 7, 30, 90]
const ABAS = [
  { valor: 'visao', rotulo: 'Visão geral' },
  { valor: 'sintese', rotulo: 'Síntese', etiqueta: 'Novo' },
  { valor: 'consultas', rotulo: 'Consultas' },
  { valor: 'medicamentos', rotulo: 'Medicamentos' },
  { valor: 'exames', rotulo: 'Exames' },
  { valor: 'perfil', rotulo: 'Perfil e peso' },
  { valor: 'configuracao', rotulo: 'Configuração' },
]

export default function Paciente() {
  const { id } = useParams()
  const [perfil, setPerfil] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [dados, setDados] = useState(null)
  const [periodo, setPeriodo] = useState('consulta')
  const [aba, setAba] = useState('visao')

  const { ultima, proxima } = situarConsultas(consultas)
  const desdeConsulta = periodo === 'consulta' && ultima
  // Conta o dia da consulta: o que foi registrado nele também entra no período.
  const dias = desdeConsulta ? diasEntre(ultima.inicio.slice(0, 10), hojeISO()) + 1 : periodo === 'consulta' ? 30 : periodo

  const carregar = useCallback(async () => {
    const [p, cs] = await Promise.all([buscarPerfil(id), listarConsultas(id)])
    setPerfil(p)
    setConsultas(cs)
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    if (perfil) carregarAcompanhamento(perfil, dias).then(setDados)
  }, [perfil, dias])

  if (!perfil || !dados) return <p className="text-textoSecundario">Carregando…</p>

  const { resumo, sinais } = dados
  const descricaoPeriodo = desdeConsulta ? `desde a última consulta (${formatarDia(ultima.inicio)})` : `nos últimos ${dias} dias`

  return (
    <div className="space-y-6">
      <Link to="/app/admin" className="inline-flex items-center gap-1 font-interface text-sm font-semibold text-textoSecundario hover:text-carmim">
        <ArrowLeft size={16} aria-hidden /> Pacientes
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{perfil.nome}</h1>
          <p className="mt-1 text-sm text-textoSecundario">
            {resumo.idade !== null && `${resumo.idade} anos`}
            {perfil.alturaCm && ` · ${perfil.alturaCm} cm`}
            {resumo.pesoAtual && ` · ${formatarNumero(resumo.pesoAtual.pesoKg)} kg`}
            {resumo.imc && ` · IMC ${formatarImc(resumo.imc.valor)}`}
            {perfil.situacao !== 'ativo' && ` · acompanhamento ${perfil.situacao}`}
          </p>
          <button
            onClick={() => setAba('consultas')}
            className="mt-2 inline-flex items-center gap-1.5 text-left text-sm text-textoSecundario hover:text-carmim"
          >
            <CalendarDays size={15} className="shrink-0 text-carmim" aria-hidden />
            <span>
              {proxima ? (
                <>
                  Próxima consulta: <strong className="text-texto">{formatarQuando(proxima.inicio)}</strong>
                </>
              ) : (
                'Sem consulta marcada'
              )}
              {ultima && ` · última em ${formatarDia(ultima.inicio)}`}
            </span>
          </button>
          {sinais.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sinais.map((s) => <Sinal key={s.texto} tipo={s.tipo}>{s.texto}</Sinal>)}
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-1 rounded-full bg-branco p-1 shadow-cartao" role="group" aria-label="Período">
            {PERIODOS.filter((p) => p !== 'consulta' || ultima).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                aria-pressed={periodo === p}
                className={`rounded-full px-3.5 py-1.5 font-interface text-xs font-semibold ${periodo === p ? 'bg-noite text-branco' : 'text-textoSecundario hover:text-texto'}`}
              >
                {p === 'consulta' ? 'Desde a última consulta' : `${p} dias`}
              </button>
            ))}
          </div>
          {desdeConsulta && (
            <p className="mt-1.5 pl-3 text-xs text-textoSecundario">
              {formatarDia(ultima.inicio)} até hoje · {dias} dias
            </p>
          )}
        </div>
      </header>

      <Abas abas={ABAS} ativa={aba} aoMudar={setAba} />

      {aba === 'visao' && <VisaoGeral perfil={perfil} dados={dados} dias={dias} />}
      {aba === 'sintese' && <Sintese dados={dados} dias={dias} descricaoPeriodo={descricaoPeriodo} proxima={proxima} />}
      {aba === 'consultas' && <Consultas perfil={perfil} consultas={consultas} aoMudar={carregar} />}
      {aba === 'medicamentos' && <Medicamentos perfil={perfil} />}
      {aba === 'exames' && <Exames perfil={perfil} />}
      {aba === 'perfil' && <PerfilEPeso perfil={perfil} dados={dados} aoMudar={carregar} />}
      {aba === 'configuracao' && <Configuracao perfil={perfil} config={dados.config} aoMudar={carregar} />}
    </div>
  )
}
