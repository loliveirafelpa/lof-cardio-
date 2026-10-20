// Perfis (cardiologista e pacientes). PROTÓTIPO: lê e grava no banco de demonstração do navegador.
// Na versão com Supabase: tabela `profiles` com RLS; criar paciente vira Edge Function (precisa da service role).
import { ler, gravar, novoId, esperar } from './demo/banco'
import { CONFIGURACAO_PADRAO } from './demo/semente'
import { hojeISO } from './datas'

export async function buscarMeuPerfil(userId) {
  await esperar()
  const perfil = ler('perfis').find((p) => p.id === userId)
  if (!perfil) throw new Error('Perfil não encontrado')
  return perfil
}

export async function listarPerfisDemonstracao() {
  return ler('perfis')
}

export async function listarPacientes() {
  await esperar()
  return ler('perfis')
    .filter((p) => p.role === 'paciente')
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export const buscarPerfil = buscarMeuPerfil

export async function atualizarPerfil(id, campos) {
  await esperar()
  gravar((b) => {
    const p = b.perfis.find((x) => x.id === id)
    Object.assign(p, campos)
  })
}

// Sem caracteres ambíguos (0/O, 1/l/I) para facilitar digitar a senha recebida por WhatsApp.
function gerarSenhaProvisoria(tamanho = 10) {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(tamanho))
  return Array.from(bytes, (b) => letras[b % letras.length]).join('')
}

// Cadastro feito pela cardiologista: perfil, peso inicial e configuração do acompanhamento.
export async function criarPaciente({ nome, email, dataNascimento, alturaCm, pesoKg, configuracao }, autor) {
  await esperar()
  if (ler('perfis').some((p) => p.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Já existe uma conta com este e-mail.')
  }
  const id = novoId()
  const agora = new Date().toISOString()
  gravar((b) => {
    b.perfis.push({ id, role: 'paciente', nome, email, dataNascimento, alturaCm, situacao: 'ativo', criadoEm: agora })
    if (pesoKg) b.pesagens.push({ id: novoId(), userId: id, medidoEm: hojeISO(), pesoKg, alturaCm })
    b.configuracoes[id] = structuredClone(configuracao ?? CONFIGURACAO_PADRAO)
    b.historicoConfiguracao.push({ id: novoId(), userId: id, autor, alteradoEm: agora, descricao: 'Acompanhamento iniciado.' })
  })
  return { id, senhaProvisoria: gerarSenhaProvisoria() }
}
