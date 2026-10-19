import { PROFISSIONAL } from './textosLegais'

// Primeira versão da política. Pendentes, a definir com a cardiologista antes dos pacientes reais:
// nome e CRM dela, canal de contato para privacidade e prazo de guarda após o fim do acompanhamento.
export const SECOES_POLITICA = [
  {
    titulo: 'Quem cuida dos seus dados',
    paragrafos: [
      `A LOF Heart é usada no seu acompanhamento cardiológico com ${PROFISSIONAL.nome} (${PROFISSIONAL.registro}). Ela é a responsável pelo uso clínico das informações; a LOF mantém o aplicativo funcionando.`,
    ],
  },
  {
    titulo: 'O que é registrado',
    itens: [
      'Dados de cadastro: nome, e-mail, data de nascimento, altura e peso.',
      'O que você registra: pressão arterial, peso, sono, tabagismo (se ativado), consumo de álcool, atividade física, estresse, sintomas e alimentação.',
      'O que a sua médica cadastra: medicamentos prescritos e resultados de exames.',
    ],
  },
  {
    titulo: 'Para que usamos — e para que nunca usamos',
    paragrafos: [
      'Essas informações são dados pessoais sensíveis de saúde (LGPD, art. 11). Elas servem exclusivamente para apoiar o seu acompanhamento: organizar o que acontece entre as consultas para que a sua médica possa avaliar.',
      'Nunca vendemos, alugamos ou compartilhamos seus dados com empresas, planos de saúde, empregadores ou anunciantes. O aplicativo não faz diagnóstico nem recomenda tratamento.',
    ],
  },
  {
    titulo: 'Quem pode ver',
    paragrafos: [
      'Apenas você e a sua cardiologista. Essa regra é aplicada no próprio banco de dados, e não só na tela. Além da LGPD, as informações estão protegidas pelo sigilo médico.',
    ],
  },
  {
    titulo: 'Seus direitos',
    itens: [
      'Ver e corrigir o que você registrou.',
      'Baixar uma cópia dos seus dados.',
      'Apagar seus registros e pedir o encerramento da conta.',
      'Revogar o consentimento a qualquer momento — sem isso, nenhum registro novo é gravado.',
    ],
  },
  {
    titulo: 'Emergências',
    paragrafos: [
      'O aplicativo não é acompanhado em tempo real. Diante de dor no peito, falta de ar intensa, desmaio ou qualquer sintoma forte, ligue 192 (SAMU) ou procure o pronto-socorro mais próximo.',
    ],
  },
]
