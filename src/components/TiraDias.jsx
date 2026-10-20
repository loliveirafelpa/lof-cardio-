import { diasAtrasISO, formatarDia, paraData } from '../lib/datas'
import { porcentagem } from '../lib/resumo'

// Uma linha de quadradinhos, um por dia do período, para hábitos de sim/não (álcool, atividade…).
// Cheio = sim; contorno = não; tracejado claro = sem resposta. Cada quadradinho traz o dia do mês,
// e o total vem escrito ao lado: "15/30 dias · 50% do período". `valores`: { 'AAAA-MM-DD': true | false }.
export default function TiraDias({ rotulo, dias, valores, detalhe }) {
  const datas = Array.from({ length: dias }, (_, i) => diasAtrasISO(dias - 1 - i))
  const sim = datas.filter((d) => valores[d] === true).length
  const semResposta = datas.filter((d) => valores[d] === undefined).length
  const largo = dias <= 31
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p className="font-interface text-sm font-semibold">{rotulo}</p>
        <p className="numeros text-xs text-textoSecundario">
          <strong className="text-sm text-texto">
            {sim}/{dias}
          </strong>{' '}
          dias · {porcentagem(sim, dias)}% do período
          {semResposta > 0 && ` · ${semResposta} sem resposta`}
          {detalhe && ` · ${detalhe}`}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-[3px]" role="img" aria-label={`${rotulo}: ${sim} de ${dias} dias`}>
        {datas.map((d) => {
          const v = valores[d]
          const estado = v === true ? 'sim' : v === false ? 'não' : 'sem resposta'
          return (
            <span
              key={d}
              title={`${formatarDia(d)}: ${estado}`}
              className={`flex items-center justify-center rounded-[3px] font-interface text-[9px] font-semibold leading-none ${
                largo ? 'h-[18px] w-[18px]' : 'h-3.5 w-3.5'
              } ${v === true ? 'bg-carmim text-branco' : v === false ? 'border border-rosado bg-branco text-textoSecundario' : 'border border-dashed border-borda text-textoSecundario/60'}`}
            >
              {largo && paraData(d).getDate()}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function LegendaTira({ dias }) {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-textoSecundario">
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-carmim" /> Sim</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-rosado bg-branco" /> Não</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-dashed border-borda" /> Sem resposta</span>
      {dias <= 31 && <span>O número em cada quadrado é o dia do mês.</span>}
    </p>
  )
}
