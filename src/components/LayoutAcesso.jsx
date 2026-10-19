import Logo from './Logo'
import LinhaPulso from './LinhaPulso'

// Telas de acesso (entrar, criar senha). Celular: faixa escura no topo e o formulário subindo
// sobre ela. Computador: painel escuro à esquerda, com o traço de pulso, e o formulário à direita.
export default function LayoutAcesso({ titulo, children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr),minmax(0,4fr)]">
      <div className="relative overflow-hidden bg-noite px-6 pb-20 pt-10 text-branco lg:flex lg:flex-col lg:justify-between lg:p-14">
        <Logo tamanho={40} />
        <div className="relative mt-9 lg:mt-0">
          <p className="font-interface text-[11px] font-semibold uppercase tracking-[0.2em] text-rosado">
            Acompanhamento cardiovascular
          </p>
          <h1 className="mt-3 max-w-md font-titulo text-[2.1rem] font-semibold leading-tight text-branco lg:text-5xl">{titulo}</h1>
        </div>
        <LinhaPulso className="absolute inset-x-0 bottom-6 text-carmim/80 lg:static lg:mt-10" />
        <p className="relative hidden max-w-sm text-branco/70 lg:block">
          O que você mede, o que você faz e o que você sente — organizado para a sua consulta.
        </p>
      </div>
      <div className="-mt-10 flex justify-center px-4 pb-10 lg:mt-0 lg:items-center lg:bg-papel">
        <div className="relative w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
