// Datas sempre no fuso local. Dias como texto AAAA-MM-DD; instantes como ISO completo.

const doisDigitos = (n) => String(n).padStart(2, '0')

export function diaISO(data = new Date()) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

export const hojeISO = () => diaISO()

// AAAA-MM-DD de N dias atrás (0 = hoje).
export function diasAtrasISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return diaISO(d)
}

export function paraData(valor) {
  if (valor instanceof Date) return valor
  // Dia puro vira meio-dia local, para não "voltar um dia" por causa do fuso.
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T12:00:00`) : new Date(valor)
}

export const formatarDia = (valor, opcoes = { day: '2-digit', month: '2-digit' }) =>
  paraData(valor).toLocaleDateString('pt-BR', opcoes)

export const formatarDiaLongo = (valor) =>
  paraData(valor).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

export const formatarHora = (valor) => paraData(valor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const formatarDiaHora = (valor) => `${formatarDia(valor)} · ${formatarHora(valor)}`

export function diasEntre(a, b) {
  return Math.round((paraData(b) - paraData(a)) / 86400000)
}

// Valor para <input type="datetime-local"> no fuso local.
export function paraCampoDataHora(data = new Date()) {
  return `${diaISO(data)}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`
}

export const formatarNumero = (valor, casas = 1) =>
  valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

// "hoje às 14:00", "amanhã às 10:30", "sexta, 23/10 às 9:00" (para consultas marcadas).
export function formatarQuando(valor) {
  const dias = diasEntre(hojeISO(), diaISO(paraData(valor)))
  const hora = formatarHora(valor)
  if (dias === 0) return `hoje às ${hora}`
  if (dias === 1) return `amanhã às ${hora}`
  const semana = paraData(valor).toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')
  return `${semana}, ${formatarDia(valor)} às ${hora}`
}
