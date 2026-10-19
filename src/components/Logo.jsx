import { HeartPulse } from 'lucide-react'

// Marca provisória da LOF Heart: coração com pulso num selo carmim + nome em caixa-alta espaçada.
// `claro`: para usar sobre fundo escuro (cabeçalho, telas de acesso).
export default function Logo({ tamanho = 36, claro = true, comNome = true }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex shrink-0 items-center justify-center rounded-xl bg-carmim text-branco"
        style={{ width: tamanho, height: tamanho }}
      >
        <HeartPulse size={tamanho * 0.58} strokeWidth={1.75} aria-hidden />
      </span>
      {comNome && (
        <p className={`font-interface text-xs font-semibold uppercase leading-tight tracking-[0.22em] ${claro ? 'text-branco' : 'text-texto'}`}>
          LOF <span className={claro ? 'text-rosado' : 'text-carmim'}>Heart</span>
        </p>
      )}
    </div>
  )
}
