// Configuração do acompanhamento de cada paciente (módulos, frequência, limites) e o histórico
// de quem alterou e quando. PROTÓTIPO: banco de demonstração do navegador.
// Na versão com Supabase: tabela `configuracoes_acompanhamento` (só a médica grava) e um gatilho
// que registra cada alteração em `configuracoes_historico`.
import { ler, gravar, novoId, esperar } from './demo/banco'
import { MODULOS, PERGUNTAS_ALIMENTACAO, TIPOS_TABAGISMO, FREQUENCIAS } from '../data/checkinOpcoes'

export async function buscarConfiguracao(userId) {
  await esperar()
  return ler('configuracoes')[userId]
}

export async function listarHistoricoConfiguracao(userId) {
  await esperar()
  return ler('historicoConfiguracao')
    .filter((h) => h.userId === userId)
    .sort((a, b) => b.alteradoEm.localeCompare(a.alteradoEm))
}

const rotulo = (lista, chave, campo = 'valor') => lista.find((i) => i[campo] === chave)?.rotulo ?? chave

// Descreve em português o que mudou, para o histórico de auditoria.
function descreverMudancas(antes, depois) {
  const frases = []
  for (const { chave, rotulo: nome } of MODULOS) {
    if (antes.modulos[chave] !== depois.modulos[chave]) {
      frases.push(`${depois.modulos[chave] ? 'Ativou' : 'Desativou'} o módulo ${nome}.`)
    }
  }
  if (antes.frequencia !== depois.frequencia) {
    frases.push(`Frequência de preenchimento: ${rotulo(FREQUENCIAS, depois.frequencia)}.`)
  }
  if (antes.tabagismoTipo !== depois.tabagismoTipo) {
    frases.push(`Tabagismo acompanhado: ${rotulo(TIPOS_TABAGISMO, depois.tabagismoTipo).toLowerCase()}.`)
  }
  for (const { chave, rotulo: pergunta } of PERGUNTAS_ALIMENTACAO) {
    const tinha = antes.alimentacaoPerguntas.includes(chave)
    const tem = depois.alimentacaoPerguntas.includes(chave)
    if (tinha !== tem) frases.push(`${tem ? 'Incluiu' : 'Retirou'} a pergunta “${pergunta}”`)
  }
  const la = antes.limitesPressao
  const ld = depois.limitesPressao
  if (JSON.stringify(la) !== JSON.stringify(ld)) {
    frases.push(`Limites de pressão para conferência: destacar a partir de ${ld.sistolicaMax}/${ld.diastolicaMax} e abaixo de ${ld.sistolicaMin}/${ld.diastolicaMin} mmHg.`)
  }
  if (antes.mostrarMediasPressao !== depois.mostrarMediasPressao) {
    frases.push(depois.mostrarMediasPressao ? 'Passou a mostrar médias de pressão.' : 'Deixou de mostrar médias de pressão.')
  }
  return frases
}

export async function salvarConfiguracao(userId, nova, autor) {
  await esperar()
  gravar((b) => {
    const frases = descreverMudancas(b.configuracoes[userId], nova)
    b.configuracoes[userId] = structuredClone(nova)
    const alteradoEm = new Date().toISOString()
    frases.forEach((descricao) => b.historicoConfiguracao.push({ id: novoId(), userId, autor, alteradoEm, descricao }))
  })
}

export async function registrarNoHistorico(userId, descricao, autor) {
  gravar((b) => {
    b.historicoConfiguracao.push({ id: novoId(), userId, autor, alteradoEm: new Date().toISOString(), descricao })
  })
}
