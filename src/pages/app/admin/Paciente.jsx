import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { buscarPerfil } from '../../../lib/perfisApi'
import { listarConsultas, situarConsultas } from '../../../lib/consultasApi'
import { carregarAcompanhamento } from '../../../lib/acompanhamento'
import { formatarImc } from '../../../lib/imc'
import { diasAtrasISO, diasEntre, formatarDia, formatarNumero, formatarQuando, hojeISO } from '../../../lib/datas'
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
// 'datas' = intervalo escolhido pela médica (de/até), inclusive no passado.
const PERIODOS = ['consulta', 7, 30, 90, 'datas']
const ROTULO_PERIODO = { consulta: 'Desde a última consulta', datas: 'Escolher datas' }
const MAX_DIAS_INTERVALO = 730

const intervaloValido = ({ desde, ate }) =>
  Boolean(desde && ate && desde <= ate && ate <= hojeISO() && diasEntre(desde, ate) < MAX_DIAS_INTERVALO)
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
  // `campos` guarda o que está digitado; `intervalo` é o último período válido, que alimenta o painel.
  const [campos, setCampos] = useState({ desde: diasAtrasISO(29), ate: hojeISO() })
  const [intervalo, setIntervalo] = useState(campos)
  const [aba, setAba] = useState('visao')

  const { ultima, proxima } = situarConsultas(consultas)
  const desdeConsulta = periodo === 'consulta' && ultima
  const porDatas = periodo === 'datas'
  const ate = porDatas ? intervalo.ate : hojeISO()
  // Conta o primeiro e o último dia: o que foi registrado neles também entra no período.
  const dias = porDatas
    ? diasEntre(intervalo.desde, intervalo.ate) + 1
    : desdeConsulta
      ? diasEntre(ultima.inicio.slice(0, 10), hojeISO()) + 1
      : periodo === 'consulta'
        ? 30
        : periodo

  // Enquanto a data está incompleta, invertida, no futuro ou longa demais, o painel segue no último período válido.
  const camposValidos = intervaloValido(campos)

  function mudarCampo(campo, valor) {
    const novo = { ...campos, [campo]: valor }
    setCampos(novo)
    if (intervaloValido(novo)) setIntervalo(novo)
  }

  const carregar = useCallback(async () => {
    const [p, cs] = await Promise.all([buscarPerfil(id), listarConsultas(id)])
    setPerfil(p)
    setConsultas(cs)
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    if (perfil) carregarAcompanhamento(perfil, dias, ate).then(setDados)
  }, [perfil, dias, ate])

  if (!perfil || !dados) return <p className="text-textoSecundario">Carregando…</p>

  const { resumo, sinais } = dados
  const descricaoPeriodo = porDatas
    ? `de ${formatarDia(intervalo.desde)} a ${formatarDia(intervalo.ate)}`
    : desdeConsulta
      ? `desde a última consulta (${formatarDia(ultima.inicio)})`
      : `nos últimos ${dias} dias`

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
                {ROTULO_PERIODO[p] ?? `${p} dias`}
              </button>
            ))}
          </div>
          {desdeConsulta && (
            <p className="mt-1.5 pl-3 text-xs text-textoSecundario">
              {formatarDia(ultima.inicio)} até hoje · {dias} dias
            </p>
          )}
          {porDatas && (
            <div className="mt-2 flex flex-wrap items-center gap-2 pl-3 font-interface text-xs text-textoSecundario">
              <label htmlFor="periodo-desde">De</label>
              <input
                id="periodo-desde"
                type="date"
                value={campos.desde}
                max={campos.ate || hojeISO()}
                onChange={(e) => mudarCampo('desde', e.target.value)}
                className="rounded-lg border border-borda bg-branco px-2.5 py-1.5 text-sm text-texto"
              />
              <label htmlFor="periodo-ate">até</label>
              <input
                id="periodo-ate"
                type="date"
                value={campos.ate}
                min={campos.desde}
                max={hojeISO()}
                onChange={(e) => mudarCampo('ate', e.target.value)}
                className="rounded-lg border border-borda bg-branco px-2.5 py-1.5 text-sm text-texto"
              />
              <span>· {dias} dias</span>
              {!camposValidos && (
                <span className="basis-full text-atencao" role="status">
                  Escolha a data inicial antes da final, até hoje e com no máximo 2 anos. Mostrando {formatarDia(intervalo.desde)} a {formatarDia(intervalo.ate)}.
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <Abas abas={ABAS} ativa={aba} aoMudar={setAba} />

      {aba === 'visao' && <VisaoGeral perfil={perfil} dados={dados} dias={dias} ate={ate} />}
      {aba === 'sintese' && <Sintese dados={dados} dias={dias} ate={ate} descricaoPeriodo={descricaoPeriodo} proxima={proxima} />}
      {aba === 'consultas' && <Consultas perfil={perfil} consultas={consultas} aoMudar={carregar} />}
      {aba === 'medicamentos' && <Medicamentos perfil={perfil} />}
      {aba === 'exames' && <Exames perfil={perfil} />}
      {aba === 'perfil' && <PerfilEPeso perfil={perfil} dados={dados} aoMudar={carregar} />}
      {aba === 'configuracao' && <Configuracao perfil={perfil} config={dados.config} aoMudar={carregar} />}
    </div>
  )
}
