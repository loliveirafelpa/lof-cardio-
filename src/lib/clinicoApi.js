// Dados clínicos cadastrados pela cardiologista: medicamentos, exames e antecedentes.
// PROTÓTIPO: banco de demonstração do navegador.
// Na versão com Supabase: tabelas `medicamentos`, `exames` e `antecedentes` (uma linha por paciente)
// com RLS só da médica (o paciente não grava).
import { ler, gravar, novoId, esperar } from './demo/banco'

export async function listarMedicamentos(userId) {
  await esperar()
  return ler('medicamentos')
    .filter((m) => m.userId === userId)
    .sort((a, b) => b.inicio.localeCompare(a.inicio))
}

// Com `id`: atualiza; sem: cria.
export async function salvarMedicamento(userId, medicamento) {
  await esperar()
  gravar((b) => {
    const existente = medicamento.id && b.medicamentos.find((m) => m.id === medicamento.id)
    if (existente) Object.assign(existente, medicamento)
    else b.medicamentos.push({ ...medicamento, id: novoId(), userId })
  })
}

export async function removerMedicamento(id) {
  await esperar()
  gravar((b) => {
    b.medicamentos = b.medicamentos.filter((m) => m.id !== id)
  })
}

export async function listarExames(userId) {
  await esperar()
  return ler('exames')
    .filter((e) => e.userId === userId)
    .sort((a, b) => a.data.localeCompare(b.data))
}

export async function salvarExame(userId, exame) {
  await esperar()
  gravar((b) => {
    const existente = exame.id && b.exames.find((e) => e.id === exame.id)
    if (existente) Object.assign(existente, exame)
    else b.exames.push({ ...exame, id: novoId(), userId })
  })
}

export async function removerExame(id) {
  await esperar()
  gravar((b) => {
    b.exames = b.exames.filter((e) => e.id !== id)
  })
}

export async function buscarAntecedentes(userId) {
  await esperar()
  return ler('antecedentes').find((a) => a.userId === userId) ?? null
}

// Um registro por paciente: cria na primeira vez e atualiza nas seguintes, guardando quem alterou e quando.
export async function salvarAntecedentes(userId, antecedentes, autor) {
  await esperar()
  gravar((b) => {
    const dados = { ...antecedentes, atualizadoPor: autor, atualizadoEm: new Date().toISOString() }
    const existente = b.antecedentes.find((a) => a.userId === userId)
    if (existente) Object.assign(existente, dados)
    else b.antecedentes.push({ ...dados, id: novoId(), userId })
  })
}
