// Cálculo e classificação do IMC — regras fixas, sem diagnóstico.
// A classificação adulta só vale a partir dos 20 anos; abaixo disso (e para gestantes,
// a definir com a cardiologista) o IMC é mostrado sem classificação.

export const IDADE_MINIMA_CLASSIFICACAO = 20
export const IMC_ATENCAO = 30

const FAIXAS = [
  { ate: 18.5, rotulo: 'Baixo peso' },
  { ate: 25, rotulo: 'Faixa habitual' },
  { ate: 30, rotulo: 'Sobrepeso' },
  { ate: 35, rotulo: 'Obesidade classe I' },
  { ate: 40, rotulo: 'Obesidade classe II' },
  { ate: Infinity, rotulo: 'Obesidade classe III' },
]

// Idade em anos completos na data de referência (padrão: hoje). `nascimento` em AAAA-MM-DD.
export function calcularIdade(nascimento, referencia = new Date()) {
  if (!nascimento) return null
  const [a, m, d] = nascimento.split('-').map(Number)
  let idade = referencia.getFullYear() - a
  const mes = referencia.getMonth() + 1
  if (mes < m || (mes === m && referencia.getDate() < d)) idade -= 1
  return idade
}

// IMC com uma casa decimal, a partir do peso em kg e da altura em cm.
export function calcularImc(pesoKg, alturaCm) {
  if (!pesoKg || !alturaCm) return null
  const alturaM = alturaCm / 100
  return Math.round((pesoKg / (alturaM * alturaM)) * 10) / 10
}

// { valor, classificacao, atencao } — classificacao e atencao ficam nulas fora da faixa adulta.
export function avaliarImc(pesoKg, alturaCm, idade) {
  const valor = calcularImc(pesoKg, alturaCm)
  if (valor === null) return null
  const adulto = idade !== null && idade !== undefined && idade >= IDADE_MINIMA_CLASSIFICACAO
  if (!adulto) return { valor, classificacao: null, atencao: false }
  const faixa = FAIXAS.find((f) => valor < f.ate)
  return { valor, classificacao: faixa.rotulo, atencao: valor >= IMC_ATENCAO }
}

export const formatarImc = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
