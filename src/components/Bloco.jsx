// Cartão branco das telas. `titulo` é um rótulo curto em caixa-alta que nomeia o grupo.
export default function Bloco({ titulo, icone, acao, className = '', children }) {
  return (
    <section className={`rounded-3xl bg-branco p-5 shadow-cartao sm:p-7 ${className}`}>
      {(titulo || acao) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {titulo && (
            <h2 className="flex items-center gap-2 font-interface text-[11px] font-semibold uppercase tracking-[0.18em] text-carmim">
              {icone && <span aria-hidden>{icone}</span>}
              {titulo}
            </h2>
          )}
          {acao}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </section>
  )
}
