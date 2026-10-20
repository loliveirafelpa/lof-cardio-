import { Clock, Info, Siren, TriangleAlert } from 'lucide-react'

// Etiqueta de sinal de atenção — sempre com ícone e texto, nunca só cor.
// grave: sintoma grave declarado · atencao: fora do padrão cadastrado ·
// informativo: classificação de referência (IMC) · pendente: registro ou acesso pendente.
const ESTILOS = {
  grave: { classe: 'bg-alertaFundo text-alerta', Icone: Siren },
  atencao: { classe: 'bg-atencaoFundo text-atencao', Icone: TriangleAlert },
  informativo: { classe: 'bg-blush text-carmimEscuro', Icone: Info },
  pendente: { classe: 'bg-papel text-textoSecundario border border-borda', Icone: Clock },
}

export default function Sinal({ tipo, children }) {
  const { classe, Icone } = ESTILOS[tipo]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      <Icone size={13} aria-hidden />
      {children}
    </span>
  )
}
