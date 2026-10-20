// Indicadores de exame que a cardiologista pode cadastrar. Sem metas automáticas:
// a interpretação depende do contexto clínico de cada paciente (o campo "referência" é livre).
export const INDICADORES_EXAME = [
  { valor: 'colesterol_total', rotulo: 'Colesterol total', unidade: 'mg/dL' },
  { valor: 'ldl', rotulo: 'LDL-colesterol', unidade: 'mg/dL' },
  { valor: 'hdl', rotulo: 'HDL-colesterol', unidade: 'mg/dL' },
  { valor: 'triglicerides', rotulo: 'Triglicerídeos', unidade: 'mg/dL' },
  { valor: 'glicemia', rotulo: 'Glicemia', unidade: 'mg/dL', comTipo: true },
  { valor: 'hba1c', rotulo: 'Hemoglobina glicada', unidade: '%' },
  { valor: 'outro', rotulo: 'Outro exame', unidade: '' },
]

export const TIPOS_GLICEMIA = ['Jejum', 'Pós-prandial', 'Casual']

export const nomeDoExame = (e) =>
  e.indicador === 'outro' ? e.nomeOutro || 'Outro exame' : INDICADORES_EXAME.find((i) => i.valor === e.indicador)?.rotulo
