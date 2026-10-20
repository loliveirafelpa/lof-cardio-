import { Link } from 'react-router-dom'

const VARIANTES = {
  primario: 'bg-carmim text-branco hover:bg-carmimEscuro disabled:opacity-50',
  secundario: 'border border-carmim text-carmim hover:bg-blush disabled:opacity-50',
  discreto: 'text-carmim hover:underline',
}

const classes = (variante, className) =>
  `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-interface text-sm font-semibold transition-colors ${VARIANTES[variante]} ${className}`

export default function Botao({ variante = 'primario', className = '', ...props }) {
  return <button className={classes(variante, className)} {...props} />
}

// Link de navegação com cara de botão (nunca um <button> dentro de um <a>).
export function BotaoLink({ variante = 'primario', className = '', ...props }) {
  return <Link className={classes(variante, className)} {...props} />
}
