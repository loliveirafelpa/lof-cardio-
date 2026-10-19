import { Siren } from 'lucide-react'
import { CONTATOS_EMERGENCIA } from '../data/textosLegais'

// O app não é canal de emergência — este aviso aparece em toda a área logada do paciente.
// `compacto`: uma linha discreta no rodapé. `destaque`: versão completa, exibida na hora
// em que o paciente marca um sintoma potencialmente grave (dor no peito, falta de ar intensa, desmaio).
export default function AvisoEmergencia({ destaque = false, compacto = false }) {
  if (compacto) {
    return (
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-textoSecundario">
        <Siren size={14} className="text-alerta" aria-hidden />
        <span>Sintoma forte ou que não passa?</span>
        <a href="tel:192" className="font-interface font-bold text-alerta underline">
          Ligue 192
        </a>
        <span>— não espere a revisão da médica.</span>
      </p>
    )
  }

  return (
    <aside
      role={destaque ? 'alert' : undefined}
      className={`rounded-2xl border p-4 text-left text-sm ${destaque ? 'border-alerta/40 bg-alertaFundo' : 'border-borda bg-branco'}`}
    >
      <p className="flex items-center gap-2 font-interface font-semibold text-alerta">
        <Siren size={18} aria-hidden /> Procure atendimento de emergência agora
      </p>
      <p className="mt-1 text-texto">
        Dor ou aperto no peito, falta de ar intensa ou desmaio podem ser sinais de urgência. Este aplicativo não é
        acompanhado em tempo real: <strong>não espere a revisão da sua médica</strong>.
      </p>
      <ul className="mt-2 space-y-1">
        {CONTATOS_EMERGENCIA.map((c) => (
          <li key={c.contato}>
            <a href={`tel:${c.contato}`} className="font-interface font-bold text-alerta underline">
              {c.contato}
            </a>{' '}
            — {c.nome} <span className="text-textoSecundario">({c.detalhe})</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-textoSecundario">Ou vá ao pronto-socorro mais próximo.</p>
    </aside>
  )
}
