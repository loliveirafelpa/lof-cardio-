// Ao mudar o texto dos termos ou do consentimento, aumentar a versão:
// cada aceite fica gravado no banco com a versão que o paciente leu.
export const VERSAO_TERMOS = '2026-10-19'

// Provisório: nome e CRM reais da cardiologista ainda serão informados (CRM 00000 é só marcação).
// Ao trocar, aumentar VERSAO_TERMOS — o texto do consentimento muda.
export const PROFISSIONAL = {
  nome: 'sua cardiologista',
  registro: 'CRM 00000',
}

export const CONTATOS_EMERGENCIA = [
  { nome: 'SAMU', contato: '192', detalhe: 'emergências médicas, 24h' },
  { nome: 'Bombeiros', contato: '193', detalhe: 'se o SAMU não atender' },
]

export const TEXTO_CONSENTIMENTO_SAUDE = `Autorizo o registro e o tratamento das informações que eu compartilhar neste aplicativo sobre minha pressão arterial, peso, sono, hábitos (tabagismo, álcool, atividade física e alimentação), estresse e sintomas — que são dados pessoais sensíveis de saúde (LGPD, art. 11) — com a finalidade exclusiva de apoiar meu acompanhamento cardiológico com ${PROFISSIONAL.nome} (${PROFISSIONAL.registro}). Entendo que ela poderá ver tudo o que eu registrar aqui, e que o aplicativo organiza as informações, mas não faz diagnóstico. Sei que posso revogar este consentimento e pedir a exclusão dos meus dados a qualquer momento, dentro do próprio aplicativo.`
