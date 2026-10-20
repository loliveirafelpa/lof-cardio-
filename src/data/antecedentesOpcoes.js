// Antecedentes clínicos que a cardiologista marca na ficha. Só registro: o app não usa isso para
// calcular risco nem sugerir conduta.
export const CONDICOES = [
  { valor: 'hipertensao', rotulo: 'Hipertensão' },
  { valor: 'diabetes', rotulo: 'Diabetes' },
  { valor: 'dislipidemia', rotulo: 'Colesterol alto (dislipidemia)' },
  { valor: 'infarto', rotulo: 'Infarto prévio' },
  { valor: 'avc', rotulo: 'AVC prévio' },
  { valor: 'insuficiencia_cardiaca', rotulo: 'Insuficiência cardíaca' },
  { valor: 'arritmia', rotulo: 'Arritmia' },
  { valor: 'doenca_renal', rotulo: 'Doença renal crônica' },
]

export const ANTECEDENTES_VAZIO = { condicoes: [], cirurgias: '', familiar: '', alergias: '', observacoes: '' }

export const nomeDaCondicao = (valor) => CONDICOES.find((c) => c.valor === valor)?.rotulo ?? valor
