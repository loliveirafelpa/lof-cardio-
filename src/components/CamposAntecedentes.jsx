import { CONDICOES } from '../data/antecedentesOpcoes'
import Campo from './Campo'

// Campos do histórico clínico (antecedentes), usados no cadastro e na ficha do paciente.
// `valor`: { condicoes: [], cirurgias, familiar, alergias, observacoes }.
export default function CamposAntecedentes({ valor, aoMudar, prefixo = 'ant' }) {
  const texto = (campo) => ({ id: `${prefixo}-${campo}`, value: valor[campo], onChange: (e) => aoMudar({ ...valor, [campo]: e.target.value }) })
  const marcar = (condicao, marcado) =>
    aoMudar({ ...valor, condicoes: marcado ? [...valor.condicoes, condicao] : valor.condicoes.filter((c) => c !== condicao) })

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 font-interface text-sm font-semibold">Doenças e condições prévias</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {CONDICOES.map((c) => (
            <label key={c.valor} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-carmim"
                checked={valor.condicoes.includes(c.valor)}
                onChange={(e) => marcar(c.valor, e.target.checked)}
              />
              {c.rotulo}
            </label>
          ))}
        </div>
      </fieldset>
      <Campo rotulo="Cirurgias e procedimentos" placeholder="ex.: angioplastia (2019)" multilinha rows={2} {...texto('cirurgias')} />
      <Campo rotulo="Histórico familiar" placeholder="ex.: pai com infarto aos 55 anos" multilinha rows={2} {...texto('familiar')} />
      <Campo rotulo="Alergias" placeholder="ex.: dipirona" {...texto('alergias')} />
      <Campo rotulo="Outras observações" multilinha rows={2} {...texto('observacoes')} />
    </div>
  )
}
