// Módulos e opções do check-in cardiovascular. A cardiologista liga/desliga cada módulo por paciente;
// a ordem aqui é a ordem em que aparecem para o paciente.

export const MODULOS = [
  { chave: 'pressao', rotulo: 'Pressão arterial' },
  { chave: 'peso', rotulo: 'Peso' },
  { chave: 'sono', rotulo: 'Sono' },
  { chave: 'tabagismo', rotulo: 'Tabagismo' },
  { chave: 'alcool', rotulo: 'Álcool' },
  { chave: 'atividade', rotulo: 'Atividade física' },
  { chave: 'estresse', rotulo: 'Estresse' },
  { chave: 'sintomas', rotulo: 'Sintomas' },
  { chave: 'alimentacao', rotulo: 'Alimentação' },
]

export const QUALIDADE_SONO = [
  { valor: 1, rotulo: 'Muito ruim' },
  { valor: 2, rotulo: 'Ruim' },
  { valor: 3, rotulo: 'Regular' },
  { valor: 4, rotulo: 'Boa' },
  { valor: 5, rotulo: 'Muito boa' },
]

export const TIPOS_TABAGISMO = [
  { valor: 'convencional', rotulo: 'Cigarro convencional' },
  { valor: 'eletronico', rotulo: 'Cigarro eletrônico' },
  { valor: 'ambos', rotulo: 'Ambos' },
]

export const NIVEIS_ESFORCO = [
  { valor: 1, rotulo: 'Leve' },
  { valor: 2, rotulo: 'Moderado' },
  { valor: 3, rotulo: 'Intenso' },
]

// `grave`: ao marcar, o app mostra na hora a orientação de emergência (não espera a médica).
export const SINTOMAS = [
  { valor: 'palpitacoes', rotulo: 'Palpitações' },
  { valor: 'falta_de_ar', rotulo: 'Falta de ar' },
  { valor: 'falta_de_ar_intensa', rotulo: 'Falta de ar intensa', grave: true },
  { valor: 'dor_no_peito', rotulo: 'Dor ou desconforto no peito', grave: true },
  { valor: 'desmaio', rotulo: 'Desmaio', grave: true },
  { valor: 'tontura', rotulo: 'Tontura' },
  { valor: 'cansaco', rotulo: 'Cansaço incomum' },
  { valor: 'inchaco', rotulo: 'Inchaço nas pernas ou pés' },
  { valor: 'outro', rotulo: 'Outro' },
]

export const CONTEXTOS_SINTOMA = ['Repousando', 'Caminhando', 'Fazendo esforço físico', 'Trabalhando', 'Dormindo']

export const PERGUNTAS_ALIMENTACAO = [
  { chave: 'ultraprocessados', rotulo: 'Consumiu alimentos ultraprocessados hoje?' },
  { chave: 'salgados', rotulo: 'Consumiu alimentos que considera muito salgados?' },
  { chave: 'frutasVerduras', rotulo: 'Consumiu frutas, verduras ou legumes?' },
]
