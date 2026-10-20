// Junta tudo o que o painel da cardiologista precisa de um paciente, já com o resumo do período.
import { buscarConfiguracao } from './configuracoesApi'
import { temConsentimentoSaudeVigente } from './consentimentosApi'
import { listarCheckins, listarPesagens, listarPressoes, listarSintomas } from './registrosApi'
import { resumirPeriodo, sinaisDeAtencao } from './resumo'

export async function carregarAcompanhamento(perfil, dias) {
  const [config, consentiu, pressoes, pesagens, checkins, sintomas] = await Promise.all([
    buscarConfiguracao(perfil.id),
    temConsentimentoSaudeVigente(perfil.id),
    listarPressoes(perfil.id),
    listarPesagens(perfil.id),
    listarCheckins(perfil.id),
    listarSintomas(perfil.id),
  ])
  const resumo = resumirPeriodo({ perfil, config, pressoes, pesagens, checkins, sintomas, dias })
  const sinais = sinaisDeAtencao(resumo, { consentiu, situacao: perfil.situacao })
  return { config, consentiu, pressoes, pesagens, checkins, sintomas, resumo, sinais }
}
