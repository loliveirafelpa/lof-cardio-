// Traço de eletrocardiograma, como a linha que atravessa o coração no pôster de referência.
// Ocupa a largura do contêiner; a cor vem de `className` (text-*).
export default function LinhaPulso({ className = '' }) {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className={`h-8 w-full ${className}`} aria-hidden>
      <path
        d="M0 24 H170 L180 24 L186 6 L194 36 L201 18 L206 24 H400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
