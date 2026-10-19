import { TriangleAlert } from 'lucide-react'

// Número em destaque (última pressão, IMC, sono médio…). `atencao`: faixa âmbar com um recado curto,
// para indicar algo a conversar na consulta — nunca como diagnóstico.
export default function Indicador({ rotulo, valor, unidade, detalhe, atencao }) {
  return (
    <div className="flex flex-col rounded-2xl border border-borda bg-branco p-4">
      <p className="font-interface text-[11px] font-semibold uppercase tracking-[0.16em] text-textoSecundario">{rotulo}</p>
      <p className="numeros mt-2 flex flex-wrap items-baseline gap-x-1 font-titulo text-[2rem] font-semibold leading-none text-texto">
        {valor}
        {unidade && <span className="font-interface text-sm font-medium text-textoSecundario">{unidade}</span>}
      </p>
      {detalhe && <p className="mt-1.5 text-sm text-textoSecundario">{detalhe}</p>}
      {atencao && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-atencaoFundo px-2.5 py-1.5 text-xs font-semibold text-atencao">
          <TriangleAlert size={14} className="mt-px shrink-0" aria-hidden />
          {atencao}
        </p>
      )}
    </div>
  )
}
