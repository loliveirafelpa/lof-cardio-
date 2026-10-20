// O que o paciente registra: pressão, pesagens, check-ins diários e episódios de sintomas.
// PROTÓTIPO: banco de demonstração do navegador.
// Na versão com Supabase: tabelas `medicoes_pressao`, `pesagens`, `checkins` e `sintomas`,
// todas com RLS (_select_own/_insert_own/_update_own/_delete_own) + leitura pela médica.
import { ler, gravar, novoId, esperar } from './demo/banco'

const doPaciente = (tabela, userId, campoData, desde) =>
  ler(tabela)
    .filter((r) => r.userId === userId && (!desde || r[campoData] >= desde))
    .sort((a, b) => a[campoData].localeCompare(b[campoData]))

// Todas as listas vêm em ordem cronológica (mais antigo primeiro). `desde`: AAAA-MM-DD opcional.
export async function listarPressoes(userId, desde) {
  await esperar()
  return doPaciente('pressoes', userId, 'medidoEm', desde)
}

export async function listarPesagens(userId) {
  await esperar()
  return doPaciente('pesagens', userId, 'medidoEm')
}

export async function listarCheckins(userId, desde) {
  await esperar()
  return doPaciente('checkins', userId, 'data', desde)
}

export async function listarSintomas(userId, desde) {
  await esperar()
  return doPaciente('sintomas', userId, 'ocorridoEm', desde)
}

export async function buscarCheckin(userId, data) {
  await esperar()
  return ler('checkins').find((c) => c.userId === userId && c.data === data) ?? null
}

// Salva o check-in do dia (um por dia: se já existe, atualiza) e, juntos, o que mais vier preenchido.
export async function salvarCheckinCompleto(userId, { data, checkin, pressao, pesagem, sintoma }) {
  await esperar()
  gravar((b) => {
    const existente = b.checkins.find((c) => c.userId === userId && c.data === data)
    if (existente) Object.assign(existente, checkin)
    else b.checkins.push({ id: novoId(), userId, data, ...checkin, criadoEm: new Date().toISOString() })
    if (pressao) b.pressoes.push({ id: novoId(), userId, ...pressao })
    if (pesagem) b.pesagens.push({ id: novoId(), userId, ...pesagem })
    if (sintoma) b.sintomas.push({ id: novoId(), userId, ...sintoma })
  })
}

export async function removerPressao(userId, id) {
  await esperar()
  gravar((b) => {
    b.pressoes = b.pressoes.filter((p) => !(p.id === id && p.userId === userId))
  })
}
