import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { corrigirPesagem, listarCheckins, listarPesagens, listarPressoes, listarSintomas, removerPesagem, removerPressao } from '../../lib/registrosApi'
import { avaliarImc, calcularIdade, formatarImc } from '../../lib/imc'
import { diasAtrasISO, formatarDia, formatarDiaHora, formatarNumero, hojeISO } from '../../lib/datas'
import { nomeDoSintoma } from '../../lib/resumo'
import { QUALIDADE_SONO } from '../../data/checkinOpcoes'
import Abas from '../../components/Abas'
import Bloco from '../../components/Bloco'
import GraficoLinha from '../../components/GraficoLinha'
import Pagina, { Destaque } from '../../components/Pagina'

const DIAS = 30

// Histórico do paciente: o que ele registrou, em ordem cronológica e em gráfico.
// Ele pode apagar uma pressão, corrigir ou apagar uma pesagem e ajustar check-ins anteriores (direito de correção).
export default function Historico() {
  const { perfil } = useAuth()
  const [params] = useSearchParams()
  const [aba, setAba] = useState(params.get('aba') ?? 'pressao')
  const [dados, setDados] = useState(null)
  const desde = diasAtrasISO(DIAS - 1)

  const carregar = useCallback(() => {
    Promise.all([listarPressoes(perfil.id, desde), listarPesagens(perfil.id), listarCheckins(perfil.id, desde), listarSintomas(perfil.id)]).then(
      ([pressoes, pesagens, checkins, sintomas]) => setDados({ pressoes, pesagens, checkins, sintomas }),
    )
  }, [perfil.id, desde])

  useEffect(carregar, [carregar])

  async function apagar(id) {
    await removerPressao(perfil.id, id)
    carregar()
  }

  async function corrigirPeso(id, pesoKg) {
    await corrigirPesagem(perfil.id, id, pesoKg)
    carregar()
  }

  async function apagarPeso(id) {
    await removerPesagem(perfil.id, id)
    carregar()
  }

  return (
    <Pagina sobretitulo={`Últimos ${DIAS} dias`} titulo={<>Seu <Destaque>histórico</Destaque></>}>
      <Bloco>
        <Abas
          abas={[
            { valor: 'pressao', rotulo: 'Pressão' },
            { valor: 'peso', rotulo: 'Peso e IMC' },
            { valor: 'dias', rotulo: 'Check-ins' },
            { valor: 'sintomas', rotulo: 'Sintomas' },
          ]}
          ativa={aba}
          aoMudar={setAba}
        />
        {!dados ? (
          <p className="text-textoSecundario">Carregando…</p>
        ) : aba === 'pressao' ? (
          <Pressao pressoes={dados.pressoes} desde={desde} aoApagar={apagar} />
        ) : aba === 'peso' ? (
          <Peso pesagens={dados.pesagens} perfil={perfil} aoCorrigir={corrigirPeso} aoApagar={apagarPeso} />
        ) : aba === 'dias' ? (
          <Dias checkins={dados.checkins} />
        ) : (
          <Sintomas sintomas={dados.sintomas} />
        )}
      </Bloco>
    </Pagina>
  )
}

function Pressao({ pressoes, desde, aoApagar }) {
  const [confirmar, setConfirmar] = useState(null)
  return (
    <>
      <GraficoLinha
        comHora
        unidade="mmHg"
        desde={desde}
        ate={hojeISO()}
        series={[
          { nome: 'Sistólica', cor: 'carmim', pontos: pressoes.map((p) => ({ x: p.medidoEm, y: p.sistolica })) },
          { nome: 'Diastólica', cor: 'ardosia', pontos: pressoes.map((p) => ({ x: p.medidoEm, y: p.diastolica })) },
        ]}
      />
      <ul className="divide-y divide-borda">
        {[...pressoes].reverse().map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
            <div>
              <p className="font-titulo text-lg font-semibold">
                {p.sistolica}/{p.diastolica} <span className="font-interface text-xs font-medium text-textoSecundario">mmHg</span>
              </p>
              <p className="text-xs text-textoSecundario">
                {formatarDiaHora(p.medidoEm)}
                {p.emRepouso === true && ' · em repouso'}
                {p.aparelho && ` · ${p.aparelho}`}
              </p>
            </div>
            {confirmar === p.id ? (
              <span className="flex items-center gap-2 text-xs">
                Apagar?
                <button onClick={() => aoApagar(p.id)} className="font-semibold text-alerta underline">Sim</button>
                <button onClick={() => setConfirmar(null)} className="underline">Não</button>
              </span>
            ) : (
              <button onClick={() => setConfirmar(p.id)} aria-label="Apagar esta medição" className="rounded-full p-2 text-textoSecundario hover:bg-papel hover:text-alerta">
                <Trash2 size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

function Peso({ pesagens, perfil, aoCorrigir, aoApagar }) {
  const idade = calcularIdade(perfil.dataNascimento)
  const [editando, setEditando] = useState(null) // { id, valor }
  const [confirmar, setConfirmar] = useState(null)
  const [erro, setErro] = useState('')

  async function salvar() {
    const peso = Number(String(editando.valor).replace(',', '.'))
    if (!peso || peso < 25 || peso > 350) return setErro('Confira o peso informado, em quilos.')
    await aoCorrigir(editando.id, peso)
    setEditando(null)
    setErro('')
  }

  return (
    <>
      {pesagens.length > 1 && (
        <GraficoLinha
          desde={pesagens[0].medidoEm}
          ate={pesagens.at(-1).medidoEm}
          unidade="kg"
          formatar={(v) => formatarNumero(v)}
          series={[{ nome: 'Peso', cor: 'carmim', pontos: pesagens.map((p) => ({ x: p.medidoEm, y: p.pesoKg })) }]}
        />
      )}
      <ul className="divide-y divide-borda">
        {[...pesagens].reverse().map((p) => {
          const imc = avaliarImc(p.pesoKg, p.alturaCm, idade)
          const data = formatarDia(p.medidoEm, { day: '2-digit', month: '2-digit', year: 'numeric' })
          if (editando?.id === p.id) {
            return (
              <li key={p.id} className="space-y-2 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span>{data}</span>
                  <input
                    aria-label={`Peso em ${data}, em quilos`}
                    inputMode="decimal"
                    autoFocus
                    value={editando.valor}
                    onChange={(e) => setEditando({ ...editando, valor: e.target.value })}
                    className="w-24 rounded-lg border border-borda bg-papel px-3 py-1.5"
                  />
                  <span>kg</span>
                  <button onClick={salvar} className="font-semibold text-carmim underline">Salvar</button>
                  <button onClick={() => { setEditando(null); setErro('') }} className="underline">Cancelar</button>
                </div>
                {erro && <p className="text-xs text-alerta" role="alert">{erro}</p>}
              </li>
            )
          }
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span>
                {data}
                {p.editadoEm && <span className="block text-xs text-textoSecundario">corrigido em {formatarDia(p.editadoEm)}</span>}
              </span>
              <span className="font-semibold">{formatarNumero(p.pesoKg)} kg</span>
              <span className="text-textoSecundario">IMC {formatarImc(imc.valor)}</span>
              {confirmar === p.id ? (
                <span className="flex items-center gap-2 text-xs">
                  Apagar?
                  <button onClick={() => { aoApagar(p.id); setConfirmar(null) }} className="font-semibold text-alerta underline">Sim</button>
                  <button onClick={() => setConfirmar(null)} className="underline">Não</button>
                </span>
              ) : (
                <span className="flex">
                  <button onClick={() => setEditando({ id: p.id, valor: String(p.pesoKg).replace('.', ',') })} aria-label={`Corrigir o peso de ${data}`} className="rounded-full p-2 text-textoSecundario hover:bg-papel hover:text-texto">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setConfirmar(p.id)} aria-label={`Apagar a pesagem de ${data}`} className="rounded-full p-2 text-textoSecundario hover:bg-papel hover:text-alerta">
                    <Trash2 size={16} />
                  </button>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Dias({ checkins }) {
  if (!checkins.length) return <p className="text-sm text-textoSecundario">Nenhum check-in no período.</p>
  const qualidade = (q) => QUALIDADE_SONO.find((o) => o.valor === q)?.rotulo.toLowerCase()
  return (
    <ul className="divide-y divide-borda">
      {[...checkins].reverse().map((c) => {
        const partes = [
          c.sonoHoras !== null && `dormiu ${formatarNumero(c.sonoHoras)} h${c.sonoQualidade ? ` (${qualidade(c.sonoQualidade)})` : ''}`,
          c.estresse !== null && `estresse ${c.estresse}/10`,
          c.atividade === true && `atividade${c.atividadeMinutos ? ` ${c.atividadeMinutos} min` : ''}`,
          c.alcool === true && 'álcool',
          c.cigarros !== null && c.cigarros !== undefined && `${c.cigarros} cigarros`,
        ].filter(Boolean)
        return (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div>
              <p className="font-semibold">
                {formatarDia(c.data, { weekday: 'short', day: '2-digit', month: '2-digit' })}
                {c.editadoEm && <span className="ml-2 text-xs font-normal text-textoSecundario">ajustado em {formatarDia(c.editadoEm)}</span>}
              </p>
              <p className="text-textoSecundario">{partes.join(' · ') || 'Sem respostas'}</p>
            </div>
            <Link
              to={`/app/checkin?dia=${c.data}`}
              aria-label={`Editar o check-in de ${formatarDia(c.data)}`}
              className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-textoSecundario hover:bg-papel hover:text-texto"
            >
              <Pencil size={14} aria-hidden /> Editar
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function Sintomas({ sintomas }) {
  if (!sintomas.length) return <p className="text-sm text-textoSecundario">Nenhum sintoma relatado.</p>
  return (
    <ul className="divide-y divide-borda">
      {[...sintomas].reverse().map((s) => (
        <li key={s.id} className="py-3 text-sm">
          <p className="font-semibold">{s.sintomas.map(nomeDoSintoma).join(', ')}{s.outro && ` (${s.outro})`}</p>
          <p className="text-xs text-textoSecundario">{formatarDiaHora(s.ocorridoEm)}{s.duracao && ` · durou ${s.duracao}`}</p>
          {s.contexto && <p className="mt-1">“{s.contexto}”</p>}
        </li>
      ))}
    </ul>
  )
}
