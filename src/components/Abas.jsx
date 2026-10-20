// Abas horizontais (rolam de lado no celular). `abas`: [{ valor, rotulo }].
export default function Abas({ abas, ativa, aoMudar }) {
  return (
    <div role="tablist" className="-mx-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-borda px-4">
      {abas.map((a) => (
        <button
          key={a.valor}
          role="tab"
          type="button"
          aria-selected={ativa === a.valor}
          onClick={() => aoMudar(a.valor)}
          className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 font-interface text-sm font-semibold transition-colors ${
            ativa === a.valor ? 'border-carmim text-carmim' : 'border-transparent text-textoSecundario hover:text-texto'
          }`}
        >
          {a.rotulo}
          {a.etiqueta && <span className="ml-1.5 rounded-full bg-blush px-1.5 py-0.5 text-[10px] text-carmimEscuro">{a.etiqueta}</span>}
        </button>
      ))}
    </div>
  )
}
