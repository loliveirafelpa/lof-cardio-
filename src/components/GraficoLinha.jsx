import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cores } from '../theme'
import { formatarDia, formatarDiaHora, paraData } from '../lib/datas'

// Gráfico de linha ao longo do tempo, desenhado em SVG (sem biblioteca).
// - séries: [{ nome, cor: 'carmim' | 'ardosia', pontos: [{ x: data ISO, y: número, marca?, anotacao? }] }]
// - linhas de 2px; marcador só no último ponto (ou em todos, se forem poucos), com anel da cor do fundo;
// - legenda sempre que houver 2+ séries ou destaques; valor final escrito ao lado da linha;
// - `referencias`: linhas finas de limite (ex.: limite de pressão cadastrado pela médica);
// - `marcas`: pontos que merecem destaque (ex.: pressão fora do padrão). Cada ponto pode ter `marca: chave`,
//   e `marcas[chave] = { rotulo, cor, forma }` define a forma (triangulo, trianguloInvertido, losango, anel),
//   sempre com legenda escrita — nunca só a cor; `anotacao` num ponto escreve um rótulo curto ao lado dele;
// - passar o mouse/dedo mostra a leitura do ponto mais próximo; "Ver em tabela" lista todos os valores.
const ALTURA = 210
const MARGEM = { topo: 14, direita: 56, base: 26, esquerda: 38 }

// Forma de um destaque, com anel da cor do fundo para separar da linha.
function Forma({ forma, x, y, cor, tamanho = 7 }) {
  const t = tamanho
  const anel = forma === 'anel'
  const comum = { fill: anel ? cores.branco : cor, stroke: anel ? cor : cores.branco, strokeWidth: anel ? 2.5 : 2, strokeLinejoin: 'round' }
  if (forma === 'triangulo') return <path d={`M${x},${y - t} L${x + t},${y + t * 0.75} L${x - t},${y + t * 0.75} Z`} {...comum} />
  if (forma === 'trianguloInvertido') return <path d={`M${x},${y + t} L${x + t},${y - t * 0.75} L${x - t},${y - t * 0.75} Z`} {...comum} />
  if (forma === 'losango') return <path d={`M${x},${y - t - 1} L${x + t + 1},${y} L${x},${y + t + 1} L${x - t - 1},${y} Z`} {...comum} />
  return <circle cx={x} cy={y} r={t} {...comum} />
}

// Amostra da forma, para legendas fora do gráfico.
export function AmostraMarca({ forma, cor }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <Forma forma={forma} x={8} y={8} cor={cores[cor]} tamanho={5} />
    </svg>
  )
}

function escalaBonita(min, max) {
  const passoBruto = (max - min) / 4 || 1
  const potencia = 10 ** Math.floor(Math.log10(passoBruto))
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= passoBruto)
  const inicio = Math.floor(min / passo) * passo
  const fim = Math.ceil(max / passo) * passo
  const marcas = []
  for (let v = inicio; v <= fim + passo / 2; v += passo) marcas.push(Math.round(v * 100) / 100)
  return { inicio, fim, marcas }
}

export default function GraficoLinha({
  series,
  desde,
  ate,
  unidade = '',
  referencias = [],
  marcas = {},
  formatar = (v) => v,
  comHora = false,
  rotuloTabela = 'Data',
}) {
  const caixa = useRef(null)
  const [largura, setLargura] = useState(600)
  const [foco, setFoco] = useState(null)

  const todos = series.flatMap((s) => s.pontos)
  const temDados = todos.length > 0

  useLayoutEffect(() => {
    const el = caixa.current
    if (!el) return
    const observador = new ResizeObserver(([e]) => setLargura(Math.max(260, e.contentRect.width)))
    observador.observe(el)
    return () => observador.disconnect()
  }, [temDados])
  const geo = useMemo(() => {
    if (!todos.length) return null
    const valores = [...todos.map((p) => p.y), ...referencias.map((r) => r.valor)]
    const min = Math.min(...valores)
    const max = Math.max(...valores)
    const folga = (max - min) * 0.08 || 1
    const y = escalaBonita(min - folga, max + folga)
    const t0 = paraData(desde).getTime()
    const t1 = Math.max(paraData(ate).getTime(), t0 + 86400000)
    const w = largura - MARGEM.esquerda - MARGEM.direita
    const h = ALTURA - MARGEM.topo - MARGEM.base
    return {
      y,
      px: (x) => MARGEM.esquerda + ((paraData(x).getTime() - t0) / (t1 - t0)) * w,
      py: (v) => MARGEM.topo + (1 - (v - y.inicio) / (y.fim - y.inicio)) * h,
      marcasX: Array.from({ length: 5 }, (_, i) => new Date(t0 + ((t1 - t0) * i) / 4)),
    }
  }, [todos, referencias, desde, ate, largura])

  if (!todos.length) {
    return <p className="rounded-2xl bg-papel px-4 py-6 text-center text-sm text-textoSecundario">Nenhum registro no período.</p>
  }

  const poucos = todos.length / series.length <= 20
  const instantes = [...new Set(todos.map((p) => p.x))].sort()
  const marcasUsadas = Object.entries(marcas).filter(([chave]) => todos.some((p) => p.marca === chave))
  const marcaDe = (p) => (p?.marca ? marcas[p.marca] : null)

  function aoMover(e) {
    const r = e.currentTarget.getBoundingClientRect()
    const xMouse = ((e.clientX - r.left) / r.width) * largura
    let melhor = instantes[0]
    for (const t of instantes) if (Math.abs(geo.px(t) - xMouse) < Math.abs(geo.px(melhor) - xMouse)) melhor = t
    setFoco(melhor)
  }

  const formatarX = comHora ? formatarDiaHora : (x) => formatarDia(x)
  const leituraFoco = foco && series.map((s) => ({ ...s, ponto: s.pontos.find((p) => p.x === foco) })).filter((s) => s.ponto)
  const xFoco = foco ? geo.px(foco) : 0

  return (
    <figure>
      {(series.length > 1 || marcasUsadas.length > 0) && (
        <figcaption className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-textoSecundario">
          {series.length > 1 &&
            series.map((s) => (
              <span key={s.nome} className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full" style={{ background: cores[s.cor] }} aria-hidden />
                {s.nome}
              </span>
            ))}
          {marcasUsadas.map(([chave, m]) => (
            <span key={chave} className="flex items-center gap-1.5">
              <AmostraMarca forma={m.forma} cor={m.cor} />
              {m.rotulo}
            </span>
          ))}
        </figcaption>
      )}

      <div ref={caixa} className="relative">
        <svg
          width={largura}
          height={ALTURA}
          className="block touch-none select-none"
          onPointerMove={aoMover}
          onPointerDown={aoMover}
          onPointerLeave={() => setFoco(null)}
          role="img"
          aria-label={`Gráfico de ${series.map((s) => s.nome).join(' e ')}`}
        >
          {geo.y.marcas.map((v) => (
            <g key={v}>
              <line x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={geo.py(v)} y2={geo.py(v)} stroke={cores.grade} />
              <text x={MARGEM.esquerda - 8} y={geo.py(v)} dy="0.32em" textAnchor="end" fontSize="11" fill={cores.textoSecundario}>
                {formatar(v)}
              </text>
            </g>
          ))}
          {geo.marcasX.map((d, i) => (
            <text key={i} x={geo.px(d)} y={ALTURA - 6} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'} fontSize="11" fill={cores.textoSecundario}>
              {formatarDia(d)}
            </text>
          ))}

          {referencias.map((r) => (
            <g key={r.rotulo}>
              <line
                x1={MARGEM.esquerda}
                x2={largura - MARGEM.direita}
                y1={geo.py(r.valor)}
                y2={geo.py(r.valor)}
                stroke={cores[r.cor ?? 'atencao']}
                strokeOpacity="0.55"
                strokeDasharray={r.tracejada ? '4 3' : undefined}
              />
              <text x={largura - MARGEM.direita + 6} y={geo.py(r.valor)} dy="0.32em" fontSize="10" fill={cores.textoSecundario}>
                {r.rotulo}
              </text>
            </g>
          ))}

          {foco && <line x1={xFoco} x2={xFoco} y1={MARGEM.topo} y2={ALTURA - MARGEM.base} stroke={cores.textoSecundario} strokeOpacity="0.4" />}

          {series.map((s) => {
            const caminho = s.pontos.map((p, i) => `${i ? 'L' : 'M'}${geo.px(p.x).toFixed(1)},${geo.py(p.y).toFixed(1)}`).join(' ')
            const ultimo = s.pontos.at(-1)
            const comMarcador = (poucos ? s.pontos : [ultimo]).filter((p) => !marcaDe(p))
            return (
              <g key={s.nome}>
                <path d={caminho} fill="none" stroke={cores[s.cor]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {comMarcador.map((p) => (
                  <circle key={p.x} cx={geo.px(p.x)} cy={geo.py(p.y)} r={p.x === foco ? 5.5 : 4} fill={cores[s.cor]} stroke={cores.branco} strokeWidth="2" />
                ))}
                {foco &&
                  s.pontos
                    .filter((p) => p.x === foco && !poucos && !marcaDe(p))
                    .map((p) => <circle key="foco" cx={geo.px(p.x)} cy={geo.py(p.y)} r="5.5" fill={cores[s.cor]} stroke={cores.branco} strokeWidth="2" />)}
                {s.pontos
                  .filter((p) => marcaDe(p))
                  .map((p) => (
                    <Forma key={`m${p.x}`} forma={marcaDe(p).forma} x={geo.px(p.x)} y={geo.py(p.y)} cor={cores[marcaDe(p).cor]} tamanho={p.x === foco ? 8 : 6.5} />
                  ))}
                {s.pontos
                  .filter((p) => p.anotacao)
                  .map((p) => {
                    // Rótulo acima do ponto (ou abaixo, se o ponto estiver no topo), sem sair da área do gráfico.
                    const xa = Math.min(Math.max(geo.px(p.x), MARGEM.esquerda + 50), largura - MARGEM.direita - 50)
                    const ya = geo.py(p.y)
                    return (
                      <text
                        key={`a${p.x}`}
                        x={xa}
                        y={ya < MARGEM.topo + 24 ? ya + 22 : ya - 14}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill={cores.texto}
                        stroke={cores.branco}
                        strokeWidth="3"
                        paintOrder="stroke"
                      >
                        {p.anotacao}
                      </text>
                    )
                  })}
                {!referencias.length && !ultimo.anotacao && (
                  <text x={geo.px(ultimo.x) + 9} y={geo.py(ultimo.y)} dy="0.32em" fontSize="11" fontWeight="600" fill={cores.texto}>
                    {formatar(ultimo.y)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {foco && leituraFoco.length > 0 && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-xl border border-borda bg-branco px-3 py-2 text-xs shadow-cartao"
            style={xFoco > largura / 2 ? { right: largura - xFoco + 12 } : { left: xFoco + 12 }}
          >
            <p className="font-semibold text-texto">{formatarX(foco)}</p>
            {leituraFoco.map((s) => (
              <p key={s.nome} className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-textoSecundario">
                <span className="h-2 w-2 rounded-full" style={{ background: cores[s.cor] }} aria-hidden />
                {s.nome}: <strong className="text-texto">{formatar(s.ponto.y)} {unidade}</strong>
                {marcaDe(s.ponto) && (
                  <span className="flex items-center gap-1">
                    · <AmostraMarca forma={marcaDe(s.ponto).forma} cor={marcaDe(s.ponto).cor} /> {marcaDe(s.ponto).rotulo}
                  </span>
                )}
              </p>
            ))}
          </div>
        )}
      </div>

      <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-interface font-semibold text-textoSecundario hover:text-carmim">Ver em tabela</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-borda">
          <table className="numeros w-full text-left">
            <thead className="sticky top-0 bg-papel">
              <tr>
                <th className="px-3 py-1.5 font-semibold">{rotuloTabela}</th>
                {series.map((s) => (
                  <th key={s.nome} className="px-3 py-1.5 font-semibold">
                    {s.nome} {unidade && `(${unidade})`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...instantes].reverse().map((t) => (
                <tr key={t} className="border-t border-borda">
                  <td className="px-3 py-1.5">{formatarX(t)}</td>
                  {series.map((s) => {
                    const p = s.pontos.find((q) => q.x === t)
                    return (
                      <td key={s.nome} className="px-3 py-1.5">
                        {p ? formatar(p.y) : '—'}
                        {marcaDe(p) && <span className="text-textoSecundario"> · {marcaDe(p).rotulo}</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
