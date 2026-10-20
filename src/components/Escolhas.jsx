// Controles de resposta do check-in e dos formulários: botões grandes, fáceis de tocar no celular.

const base = 'rounded-full border px-4 py-2.5 font-interface text-sm font-semibold transition-colors'
const ativo = 'border-carmim bg-carmim text-branco'
const inativo = 'border-borda bg-branco text-texto hover:border-rosado'

export function Pergunta({ titulo, ajuda, children }) {
  return (
    <fieldset>
      <legend className="font-interface text-sm font-semibold">{titulo}</legend>
      {ajuda && <p className="mt-1 text-xs text-textoSecundario">{ajuda}</p>}
      <div className="mt-3">{children}</div>
    </fieldset>
  )
}

// Uma opção entre várias. `opcoes`: [{ valor, rotulo }]. Clicar de novo na marcada desmarca.
export function EscolhaUnica({ opcoes, valor, aoMudar, colunas }) {
  return (
    <div className={colunas ? 'grid gap-2' : 'flex flex-wrap gap-2'} style={colunas ? { gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` } : undefined}>
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={valor === o.valor}
          onClick={() => aoMudar(valor === o.valor ? null : o.valor)}
          className={`${base} ${valor === o.valor ? ativo : inativo} ${colunas ? 'px-2' : ''}`}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  )
}

export function SimNao({ valor, aoMudar }) {
  return (
    <EscolhaUnica
      colunas={2}
      opcoes={[{ valor: true, rotulo: 'Sim' }, { valor: false, rotulo: 'Não' }]}
      valor={valor}
      aoMudar={aoMudar}
    />
  )
}

// Várias opções em "chips". `opcoes`: [{ valor, rotulo }].
export function EscolhaMultipla({ opcoes, valores, aoMudar }) {
  const alternar = (v) => aoMudar(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v])
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const marcado = valores.includes(o.valor)
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={marcado}
            onClick={() => alternar(o.valor)}
            className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
              marcado ? 'border-carmim bg-blush font-semibold text-carmimEscuro' : 'border-borda bg-branco hover:border-rosado'
            }`}
          >
            {o.rotulo}
          </button>
        )
      })}
    </div>
  )
}

// Controle deslizante 0–10 com o número grande ao lado.
export function Escala({ valor, aoMudar, min = 0, max = 10, rotuloMin, rotuloMax, id }) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step="1"
          value={valor ?? Math.round((min + max) / 2)}
          onChange={(e) => aoMudar(Number(e.target.value))}
          className={`h-2 flex-1 cursor-pointer accent-carmim ${valor === null ? 'opacity-50' : ''}`}
        />
        <p className="w-16 text-right font-titulo text-2xl font-semibold">
          {valor ?? '–'}
          <span className="text-sm font-medium text-textoSecundario">/{max}</span>
        </p>
      </div>
      <div className="mt-1 flex justify-between pr-20 text-xs text-textoSecundario">
        <span>{rotuloMin}</span>
        <span>{rotuloMax}</span>
      </div>
    </div>
  )
}

// Interruptor liga/desliga (configuração dos módulos).
export function Interruptor({ ligado, aoMudar, rotulo, descricao }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="font-interface text-sm font-semibold">{rotulo}</span>
        {descricao && <span className="mt-0.5 block text-xs text-textoSecundario">{descricao}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="peer sr-only" checked={ligado} onChange={(e) => aoMudar(e.target.checked)} />
        <span className="block h-6 w-11 rounded-full bg-borda transition-colors peer-checked:bg-carmim peer-focus-visible:ring-2 peer-focus-visible:ring-carmim peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-branco shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}
