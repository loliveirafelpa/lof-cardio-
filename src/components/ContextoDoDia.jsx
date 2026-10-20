import { contextoDoDia, estresseAlto, SONO_CURTO } from '../lib/resumo'
import { formatarHora, formatarNumero } from '../lib/datas'

// O que mais foi registrado no dia de um sintoma: estresse, sono, atividade, alimentação, álcool,
// cigarros e pressão. Mostra junto, para a médica ler o contexto — não sugere causa.
// Itens que passaram dos limites aparecem em âmbar, sempre com o valor escrito.
const Item = ({ destaque, children }) => (
  <span
    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${destaque ? 'bg-atencaoFundo text-atencao' : 'bg-papel text-textoSecundario'}`}
  >
    {children}
  </span>
)

const respondeu = (v) => v !== null && v !== undefined

export default function ContextoDoDia({ data, dados, config }) {
  const { checkin: c, pressoes } = contextoDoDia(data, dados, config.limitesPressao)
  const m = config.modulos
  const itens = []
  if (c) {
    if (m.estresse && respondeu(c.estresse)) {
      itens.push(<Item key="estresse" destaque={estresseAlto(c.estresse)}>Estresse {c.estresse}/10</Item>)
    }
    if (m.sono && respondeu(c.sonoHoras)) {
      itens.push(<Item key="sono" destaque={c.sonoHoras < SONO_CURTO}>Dormiu {formatarNumero(c.sonoHoras)} h</Item>)
    }
    if (m.atividade && respondeu(c.atividade)) {
      itens.push(<Item key="atividade">{c.atividade ? `Atividade física${c.atividadeMinutos ? ` · ${c.atividadeMinutos} min` : ''}` : 'Sem atividade física'}</Item>)
    }
    if (m.alcool && respondeu(c.alcool)) itens.push(<Item key="alcool">{c.alcool ? 'Consumiu álcool' : 'Sem álcool'}</Item>)
    if (m.alimentacao && c.salgados === true) itens.push(<Item key="salgados">Comeu muito salgado</Item>)
    if (m.alimentacao && c.ultraprocessados === true) itens.push(<Item key="ultra">Comeu ultraprocessados</Item>)
    if (m.tabagismo && respondeu(c.cigarros)) itens.push(<Item key="cigarros">{c.cigarros} cigarros</Item>)
  }
  for (const p of pressoes) {
    const rotulo = { muitoAlta: ' · muito alta', alta: ' · acima do limite', baixa: ' · abaixo do limite' }[p.situacao] ?? ''
    itens.push(
      <Item key={p.id} destaque={Boolean(p.situacao)}>
        PA {p.sistolica}/{p.diastolica} às {formatarHora(p.medidoEm)}
        {rotulo}
      </Item>,
    )
  }

  if (!itens.length) return <p className="mt-1.5 text-xs text-textoSecundario">Sem check-in nem medições neste dia.</p>
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-textoSecundario">No dia:</span>
      {itens}
    </div>
  )
}
