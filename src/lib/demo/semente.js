// Dados fictícios do protótipo. Gerados sempre relativos a hoje (os últimos ~45 dias),
// com sorteio de semente fixa — a mesma demonstração toda vez que os dados são restaurados.
// O dia de hoje fica sem check-in, para quem testar poder fazer o seu.
import { diasAtrasISO } from '../datas'

export const ID_MEDICA = 'medica-demo'
const DIAS = 45

function sorteador(semente) {
  let a = semente
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const instante = (diasAtras, hora, minuto = 0) => `${diasAtrasISO(diasAtras)}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`

export const CONFIGURACAO_PADRAO = {
  modulos: {
    pressao: true,
    peso: true,
    sono: true,
    tabagismo: false,
    alcool: true,
    atividade: true,
    estresse: true,
    sintomas: true,
    alimentacao: true,
  },
  frequencia: 'diaria',
  tabagismoTipo: 'convencional',
  alimentacaoPerguntas: ['ultraprocessados', 'salgados', 'frutasVerduras'],
  // Limites definidos pela médica: fora deles a medição é destacada para conferência — nunca é diagnóstico.
  limitesPressao: { sistolicaMax: 130, diastolicaMax: 90, sistolicaMin: 90, diastolicaMin: 50 },
  mostrarMediasPressao: false,
}

const configuracao = (alteracoes = {}) => ({
  ...CONFIGURACAO_PADRAO,
  ...alteracoes,
  modulos: { ...CONFIGURACAO_PADRAO.modulos, ...alteracoes.modulos },
})

// Gera os registros diários de um paciente a partir de um "jeito de ser" (médias e hábitos).
function gerarRegistros(userId, p, sortear) {
  const pressoes = []
  const pesagens = []
  const checkins = []
  const ruido = (amplitude) => (sortear() - 0.5) * 2 * amplitude

  for (let d = DIAS; d >= p.ultimoRegistro; d--) {
    if (sortear() < p.faltas) continue
    const data = diasAtrasISO(d)
    const estresse = Math.max(0, Math.min(10, Math.round(p.estresse + ruido(2.5))))
    // Pressão de manhã; em parte dos dias, também à noite.
    const medidas = sortear() < 0.35 ? [7, 21] : [7]
    for (const hora of medidas) {
      pressoes.push({
        id: `${userId}-pa-${d}-${hora}`,
        userId,
        medidoEm: instante(d, hora, Math.floor(sortear() * 50)),
        sistolica: Math.round(p.sistolica + ruido(9) + (estresse - 5) * 0.8 - (DIAS - d) * p.tendenciaPa),
        diastolica: Math.round(p.diastolica + ruido(6) + (estresse - 5) * 0.5 - (DIAS - d) * p.tendenciaPa * 0.6),
        emRepouso: sortear() < 0.85,
        aparelho: p.aparelho,
      })
    }
    if (d % 7 === 0) {
      pesagens.push({
        id: `${userId}-peso-${d}`,
        userId,
        medidoEm: data,
        pesoKg: Math.round((p.peso - (DIAS - d) * p.tendenciaPeso + ruido(0.4)) * 10) / 10,
        alturaCm: p.altura,
      })
    }
    const atividade = sortear() < p.atividade
    checkins.push({
      id: `${userId}-ci-${d}`,
      userId,
      data,
      sonoHoras: Math.round(Math.max(4, Math.min(9.5, p.sono + ruido(1.2))) * 2) / 2,
      sonoQualidade: Math.max(1, Math.min(5, Math.round(p.sonoQualidade + ruido(1.2)))),
      cigarros: p.cigarros ? Math.max(0, Math.round(p.cigarros - (DIAS - d) * 0.12 + ruido(3))) : null,
      vapeMinutos: null,
      alcool: sortear() < p.alcool,
      atividade,
      esforco: atividade ? 1 + Math.floor(sortear() * 3) : null,
      atividadeMinutos: atividade ? 20 + Math.floor(sortear() * 5) * 10 : null,
      estresse,
      ultraprocessados: sortear() < p.ultraprocessados,
      salgados: sortear() < p.salgados,
      frutasVerduras: sortear() < p.frutas,
      criadoEm: instante(d, 21, 30),
    })
  }
  return { pressoes, pesagens, checkins }
}

export function gerarSemente() {
  const sortear = sorteador(20261019)
  const criadoEm = instante(DIAS + 2, 10)

  const perfis = [
    { id: ID_MEDICA, role: 'admin', nome: 'Dra. (nome a definir)', email: 'cardiologista@exemplo.com', criadoEm },
    { id: 'p-carlos', role: 'paciente', nome: 'Carlos Mendes', email: 'carlos@exemplo.com', dataNascimento: '1978-03-14', alturaCm: 172, situacao: 'ativo', criadoEm },
    { id: 'p-ana', role: 'paciente', nome: 'Ana Ribeiro', email: 'ana@exemplo.com', dataNascimento: '1962-07-02', alturaCm: 160, situacao: 'ativo', criadoEm },
    { id: 'p-marcos', role: 'paciente', nome: 'Marcos Lima', email: 'marcos@exemplo.com', dataNascimento: '1971-11-20', alturaCm: 180, situacao: 'ativo', criadoEm },
    { id: 'p-juliana', role: 'paciente', nome: 'Juliana Prado', email: 'juliana@exemplo.com', dataNascimento: '1987-05-09', alturaCm: 165, situacao: 'ativo', criadoEm: instante(1, 16) },
    { id: 'p-roberto', role: 'paciente', nome: 'Roberto Alves', email: 'roberto@exemplo.com', dataNascimento: '1958-01-27', alturaCm: 175, situacao: 'encerrado', criadoEm },
  ]

  const jeitos = {
    'p-carlos': { sistolica: 134, diastolica: 86, tendenciaPa: 0.08, peso: 92.6, tendenciaPeso: 0.015, altura: 172, sono: 6.5, sonoQualidade: 3, estresse: 6, cigarros: 12, alcool: 0.35, atividade: 0.35, ultraprocessados: 0.55, salgados: 0.45, frutas: 0.5, faltas: 0.12, ultimoRegistro: 1, aparelho: 'Digital de braço' },
    'p-ana': { sistolica: 146, diastolica: 91, tendenciaPa: 0.05, peso: 68.4, tendenciaPeso: 0, altura: 160, sono: 7, sonoQualidade: 3.5, estresse: 4, cigarros: 0, alcool: 0.1, atividade: 0.55, ultraprocessados: 0.25, salgados: 0.3, frutas: 0.8, faltas: 0.08, ultimoRegistro: 1, aparelho: 'Digital de pulso' },
    'p-marcos': { sistolica: 124, diastolica: 79, tendenciaPa: 0, peso: 84.5, tendenciaPeso: 0, altura: 180, sono: 7.2, sonoQualidade: 4, estresse: 3, cigarros: 0, alcool: 0.3, atividade: 0.6, ultraprocessados: 0.3, salgados: 0.2, frutas: 0.7, faltas: 0.3, ultimoRegistro: 9, aparelho: 'Digital de braço' },
    'p-roberto': { sistolica: 128, diastolica: 80, tendenciaPa: 0, peso: 79, tendenciaPeso: 0, altura: 175, sono: 7, sonoQualidade: 4, estresse: 3, cigarros: 0, alcool: 0.2, atividade: 0.5, ultraprocessados: 0.2, salgados: 0.2, frutas: 0.7, faltas: 0.2, ultimoRegistro: 25, aparelho: 'Digital de braço' },
  }

  const registros = { pressoes: [], pesagens: [], checkins: [] }
  for (const [id, jeito] of Object.entries(jeitos)) {
    const r = gerarRegistros(id, jeito, sortear)
    registros.pressoes.push(...r.pressoes)
    registros.pesagens.push(...r.pesagens)
    registros.checkins.push(...r.checkins)
  }
  // Peso informado no cadastro da paciente nova (ainda não fez o primeiro acesso).
  registros.pesagens.push({ id: 'p-juliana-peso-0', userId: 'p-juliana', medidoEm: diasAtrasISO(1), pesoKg: 61.5, alturaCm: 165 })

  const sintomas = [
    { id: 's1', userId: 'p-carlos', ocorridoEm: instante(31, 15, 20), sintomas: ['palpitacoes'], outro: '', contexto: 'Trabalhando, logo depois de uma reunião difícil', duracao: 'uns 10 minutos', grave: false },
    { id: 's2', userId: 'p-carlos', ocorridoEm: instante(17, 8, 5), sintomas: ['tontura'], outro: '', contexto: 'Levantei rápido da cama', duracao: 'menos de 1 minuto', grave: false },
    { id: 's3', userId: 'p-carlos', ocorridoEm: instante(6, 19, 40), sintomas: ['palpitacoes', 'cansaco'], outro: '', contexto: 'Subindo a escada do metrô', duracao: '5 minutos', grave: false },
    { id: 's4', userId: 'p-carlos', ocorridoEm: instante(3, 22, 10), sintomas: ['dor_no_peito'], outro: '', contexto: 'Repousando, assistindo TV', duracao: 'cerca de 2 minutos', grave: true },
    { id: 's5', userId: 'p-ana', ocorridoEm: instante(20, 18, 0), sintomas: ['inchaco'], outro: '', contexto: 'Fim do dia, depois de muito tempo em pé', duracao: 'a tarde toda', grave: false },
    { id: 's6', userId: 'p-ana', ocorridoEm: instante(8, 17, 30), sintomas: ['inchaco', 'cansaco'], outro: '', contexto: 'Trabalhando', duracao: 'algumas horas', grave: false },
  ]

  // Carlos: palpitações em parte dos dias de estresse alto, para a Síntese ter o que cruzar.
  const estressados = registros.checkins.filter((c) => c.userId === 'p-carlos' && c.estresse > 7)
  estressados.forEach((c, i) => {
    if (i % 2) return
    sintomas.push({ id: `s-carlos-${c.data}`, userId: 'p-carlos', ocorridoEm: `${c.data}T17:30:00`, sintomas: ['palpitacoes'], outro: '', contexto: 'No trabalho, dia corrido', duracao: 'alguns minutos', grave: false })
  })
  sintomas.sort((a, b) => a.ocorridoEm.localeCompare(b.ocorridoEm))
  registros.pressoes.push({ id: 'p-carlos-pa-crise', userId: 'p-carlos', medidoEm: instante(3, 22, 25), sistolica: 182, diastolica: 112, emRepouso: true, aparelho: 'Digital de braço' })
  registros.pressoes.sort((a, b) => a.medidoEm.localeCompare(b.medidoEm))

  const medicamentos = [
    { id: 'm1', userId: 'p-carlos', nome: 'Losartana', dosagem: '50 mg', frequencia: '1x ao dia, de manhã', inicio: diasAtrasISO(120), termino: null, observacoes: '' },
    { id: 'm2', userId: 'p-carlos', nome: 'Rosuvastatina', dosagem: '10 mg', frequencia: '1x ao dia, à noite', inicio: diasAtrasISO(40), termino: null, observacoes: 'Reavaliar perfil lipídico em 3 meses.' },
    { id: 'm3', userId: 'p-ana', nome: 'Anlodipino', dosagem: '5 mg', frequencia: '1x ao dia', inicio: diasAtrasISO(200), termino: null, observacoes: 'Paciente relata inchaço nos tornozelos.' },
    { id: 'm4', userId: 'p-ana', nome: 'Hidroclorotiazida', dosagem: '25 mg', frequencia: '1x ao dia, de manhã', inicio: diasAtrasISO(300), termino: diasAtrasISO(60), observacoes: 'Suspensa.' },
  ]

  const exame = (id, userId, indicador, resultado, unidade, diasAtras, extra = {}) => ({
    id, userId, indicador, resultado, unidade, data: diasAtrasISO(diasAtras), referencia: '', nomeOutro: '', tipo: '', ...extra,
  })
  const exames = [
    exame('e1', 'p-carlos', 'ldl', 168, 'mg/dL', 300),
    exame('e2', 'p-carlos', 'ldl', 152, 'mg/dL', 130),
    exame('e3', 'p-carlos', 'ldl', 121, 'mg/dL', 10),
    exame('e4', 'p-carlos', 'hdl', 38, 'mg/dL', 130),
    exame('e5', 'p-carlos', 'hdl', 41, 'mg/dL', 10),
    exame('e6', 'p-carlos', 'colesterol_total', 236, 'mg/dL', 130),
    exame('e7', 'p-carlos', 'colesterol_total', 198, 'mg/dL', 10),
    exame('e8', 'p-carlos', 'triglicerides', 210, 'mg/dL', 130),
    exame('e9', 'p-carlos', 'triglicerides', 182, 'mg/dL', 10),
    exame('e10', 'p-carlos', 'glicemia', 104, 'mg/dL', 10, { tipo: 'Jejum' }),
    exame('e11', 'p-carlos', 'hba1c', 5.8, '%', 10),
    exame('e12', 'p-ana', 'ldl', 112, 'mg/dL', 90),
    exame('e13', 'p-ana', 'glicemia', 96, 'mg/dL', 90, { tipo: 'Jejum' }),
    exame('e14', 'p-ana', 'outro', 1.1, 'mg/dL', 90, { nomeOutro: 'Creatinina' }),
  ]

  const consentimentos = ['p-carlos', 'p-ana', 'p-marcos', 'p-roberto'].flatMap((userId) => [
    { id: `${userId}-ct`, userId, tipo: 'termos_de_uso', versao: '2026-10-19', aceitoEm: criadoEm, revogadoEm: null },
    { id: `${userId}-cs`, userId, tipo: 'dado_saude', versao: '2026-10-19', aceitoEm: criadoEm, revogadoEm: null },
  ])

  const configuracoes = {
    'p-carlos': configuracao({ modulos: { tabagismo: true } }),
    'p-ana': configuracao({ alimentacaoPerguntas: ['salgados', 'frutasVerduras'], mostrarMediasPressao: true }),
    'p-marcos': configuracao({ modulos: { alimentacao: false }, frequencia: 'semanal' }),
    'p-juliana': configuracao(),
    'p-roberto': configuracao(),
  }

  // Consultas: dias negativos = no futuro. Só data e hora; a agenda real virá do sistema da médica.
  const consultas = [
    { id: 'c1', userId: 'p-carlos', inicio: instante(58, 14), observacao: 'Primeira consulta' },
    { id: 'c2', userId: 'p-carlos', inicio: instante(28, 14, 30), observacao: 'Retorno' },
    { id: 'c3', userId: 'p-carlos', inicio: instante(-2, 14), observacao: 'Retorno — revisar exames' },
    { id: 'c4', userId: 'p-ana', inicio: instante(35, 10, 30), observacao: 'Retorno' },
    { id: 'c5', userId: 'p-ana', inicio: instante(-1, 10, 30), observacao: 'Retorno' },
    { id: 'c6', userId: 'p-marcos', inicio: instante(40, 16), observacao: 'Retorno' },
    { id: 'c7', userId: 'p-juliana', inicio: instante(-16, 9), observacao: 'Primeira consulta de acompanhamento' },
    { id: 'c8', userId: 'p-roberto', inicio: instante(26, 11), observacao: 'Alta do acompanhamento' },
  ]

  const historicoConfiguracao = [
    { id: 'h1', userId: 'p-carlos', autor: 'Dra. (nome a definir)', alteradoEm: criadoEm, descricao: 'Acompanhamento iniciado.' },
    { id: 'h2', userId: 'p-carlos', autor: 'Dra. (nome a definir)', alteradoEm: criadoEm, descricao: 'Ativou o módulo Tabagismo (cigarro convencional).' },
    { id: 'h3', userId: 'p-ana', autor: 'Dra. (nome a definir)', alteradoEm: criadoEm, descricao: 'Acompanhamento iniciado.' },
    { id: 'h4', userId: 'p-ana', autor: 'Dra. (nome a definir)', alteradoEm: instante(30, 14), descricao: 'Passou a mostrar médias de pressão (protocolo definido em consulta).' },
    { id: 'h5', userId: 'p-marcos', autor: 'Dra. (nome a definir)', alteradoEm: criadoEm, descricao: 'Acompanhamento iniciado.' },
    { id: 'h7', userId: 'p-roberto', autor: 'Dra. (nome a definir)', alteradoEm: instante(24, 11), descricao: 'Encerrou o acompanhamento.' },
    { id: 'h6', userId: 'p-juliana', autor: 'Dra. (nome a definir)', alteradoEm: instante(1, 16), descricao: 'Acompanhamento iniciado.' },
  ]

  return {
    perfis,
    consentimentos,
    configuracoes,
    historicoConfiguracao,
    ...registros,
    sintomas,
    medicamentos,
    exames,
    consultas,
  }
}
