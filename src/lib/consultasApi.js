// Consultas agendadas e realizadas de cada paciente (só data e hora — nada clínico).
// PROTÓTIPO: banco de demonstração do navegador. A médica (ou a secretária) cadastra à mão.
// Na versão com Supabase: tabela `consultas` (user_id, inicio, observacao) com RLS — a médica lê e grava;
// o paciente só lê as próprias (`(select auth.uid()) = user_id`). Depois, pode ser alimentada pela
// agenda que a médica já usa (Google Agenda ou software da clínica), sem mudar as telas.
import { ler, gravar, novoId, esperar } from './demo/banco'

// Em ordem cronológica.
export async function listarConsultas(userId) {
  await esperar()
  return ler('consultas')
    .filter((c) => !userId || c.userId === userId)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
}

// Com `id`: atualiza; sem: cria.
export async function salvarConsulta(userId, consulta) {
  await esperar()
  gravar((b) => {
    const existente = consulta.id && b.consultas.find((c) => c.id === consulta.id)
    if (existente) Object.assign(existente, consulta)
    else b.consultas.push({ ...consulta, id: novoId(), userId })
  })
}

export async function removerConsulta(id) {
  await esperar()
  gravar((b) => {
    b.consultas = b.consultas.filter((c) => c.id !== id)
  })
}

// Última consulta que já aconteceu e a próxima marcada, a partir de agora.
export function situarConsultas(consultas, agora = new Date()) {
  const passadas = consultas.filter((c) => new Date(c.inicio) <= agora)
  const futuras = consultas.filter((c) => new Date(c.inicio) > agora)
  return { ultima: passadas.at(-1) ?? null, proxima: futuras[0] ?? null }
}
