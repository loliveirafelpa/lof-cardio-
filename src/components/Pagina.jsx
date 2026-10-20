import LinhaPulso from './LinhaPulso'

// Moldura das telas do paciente: faixa escura com o título (como a terceira imagem de referência),
// cortada por um traço de pulso, e o conteúdo em cartões claros que sobem levemente sobre a faixa.

// Palavra de destaque do título: itálico rosado, como o "annual" do pôster.
export function Destaque({ children }) {
  return <em className="font-medium text-rosado">{children}</em>
}

export default function Pagina({ sobretitulo, titulo, descricao, aviso, largura = 'max-w-xl', children }) {
  return (
    <>
      <div className="relative overflow-hidden bg-noite text-branco">
        <div className={`relative mx-auto ${largura} px-4 pb-20 pt-8 sm:pt-12`}>
          {sobretitulo && (
            <p className="font-interface text-[11px] font-semibold uppercase tracking-[0.2em] text-rosado">{sobretitulo}</p>
          )}
          <h1 className="mt-2 font-titulo text-[1.9rem] font-semibold leading-tight text-branco sm:text-[2.4rem]">{titulo}</h1>
          {descricao && <p className="mt-3 max-w-md leading-relaxed text-branco/75">{descricao}</p>}
          {aviso && <div className="mt-5">{aviso}</div>}
        </div>
        <LinhaPulso className="absolute inset-x-0 bottom-12 text-carmim/70" />
      </div>
      <div className={`relative mx-auto -mt-9 ${largura} space-y-5 px-4 pb-10`}>{children}</div>
    </>
  )
}
