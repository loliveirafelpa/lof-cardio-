// Consentimentos LGPD. PROTÓTIPO: banco de demonstração do navegador.
// Na versão com Supabase: tabela `consentimentos` (histórico, nunca sobrescrito; revogar = preencher revogado_em).
import { ler, gravar, novoId, esperar } from './demo/banco'
import { VERSAO_TERMOS } from '../data/textosLegais'

const vigenteDeSaude = (c, userId) => c.userId === userId && c.tipo === 'dado_saude' && !c.revogadoEm

export async function temConsentimentoSaudeVigente(userId) {
  return ler('consentimentos').some((c) => vigenteDeSaude(c, userId))
}

// Último consentimento de dado de saúde (vigente ou revogado), para mostrar ao paciente.
export async function buscarConsentimentoSaude(userId) {
  const lista = ler('consentimentos')
    .filter((c) => c.userId === userId && c.tipo === 'dado_saude')
    .sort((a, b) => b.aceitoEm.localeCompare(a.aceitoEm))
  return lista[0] ?? null
}

// Grava os dois aceites separadamente, cada um com data e hora (LGPD, Art. 11).
export async function registrarConsentimentos(userId) {
  await esperar()
  const aceitoEm = new Date().toISOString()
  gravar((b) => {
    b.consentimentos.push(
      { id: novoId(), userId, tipo: 'termos_de_uso', versao: VERSAO_TERMOS, aceitoEm, revogadoEm: null },
      { id: novoId(), userId, tipo: 'dado_saude', versao: VERSAO_TERMOS, aceitoEm, revogadoEm: null },
    )
  })
}

export async function revogarConsentimentoSaude(userId) {
  await esperar()
  const agora = new Date().toISOString()
  gravar((b) => {
    b.consentimentos.filter((c) => vigenteDeSaude(c, userId)).forEach((c) => (c.revogadoEm = agora))
  })
}
