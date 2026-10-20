import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { listarCheckins, listarPesagens, listarPressoes, listarSintomas, removerPressao } from '../../lib/registrosApi'
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
// Ele pode apagar uma medição de pressão digitada errado (direito de correção).
export default function Historico() {
  const { perfil } = useAuth()
  const [aba, setAba] = useState('pressao')
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
          <Peso pesagens={dados.pesagens} perfil={perfil} />
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

function Peso({ pesagens, perfil }) {
  const idade = calcularIdade(perfil.dataNascimento)
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
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span>{formatarDia(p.medidoEm, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span className="font-semibold">{formatarNumero(p.pesoKg)} kg</span>
              <span className="text-textoSecundario">IMC {formatarImc(imc.valor)}</span>
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
          <li key={c.id} className="py-2.5 text-sm">
            <p className="font-semibold">{formatarDia(c.data, { weekday: 'short', day: '2-digit', month: '2-digit' })}</p>
            <p className="text-textoSecundario">{partes.join(' · ') || 'Sem respostas'}</p>
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
