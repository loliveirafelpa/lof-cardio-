// Resumo de um período de acompanhamento — só regras fixas, sem IA e sem diagnóstico.
// Descreve contagens, médias e coincidências; nunca afirma causa. Médias e comparações de pressão
// só aparecem quando a médica liga essa opção (protocolo definido por ela) e há medições suficientes.
import { avaliarImc, calcularIdade } from './imc'
import { diasEntre, formatarDia, formatarNumero, hojeISO, somarDias } from './datas'
import { SINTOMAS } from '../data/checkinOpcoes'

export const MIN_MEDICOES_PARA_MEDIA = 7
export const LIMITE_ESTRESSE = 7 // destacar quando passar disso (8, 9 ou 10)
export const DIAS_PARA_INATIVO = 7
export const SONO_CURTO = 6 // noites com menos de 6 h, para os cruzamentos
// Referência fixa: hipertensão estágio 3 da Diretriz Brasileira de Hipertensão Arterial (SBC, 2020).
export const PRESSAO_MUITO_ALTA = { sistolica: 180, diastolica: 110 }

const media = (valores) => (valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : null)
const contar = (lista, criterio) => lista.filter(criterio).length
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0)
export const estresseAlto = (v) => v !== null && v !== undefined && v > LIMITE_ESTRESSE

// Situação de uma medição frente aos limites cadastrados pela médica:
// 'muitoAlta' (referência estágio 3) · 'alta' (a partir do máximo) · 'baixa' (abaixo do mínimo) · null.
// Serve para destacar e conferir, nunca para diagnosticar.
export function classificarPressao(p, limites) {
  if (p.sistolica >= PRESSAO_MUITO_ALTA.sistolica || p.diastolica >= PRESSAO_MUITO_ALTA.diastolica) return 'muitoAlta'
  if (!limites) return null
  if (p.sistolica >= limites.sistolicaMax || p.diastolica >= limites.diastolicaMax) return 'alta'
  if (p.sistolica < limites.sistolicaMin || p.diastolica < limites.diastolicaMin) return 'baixa'
  return null
}

export const foraDoPadrao = (p, limites) => classificarPressao(p, limites) !== null

export const nomeDoSintoma = (valor) => SINTOMAS.find((s) => s.valor === valor)?.rotulo ?? valor

// Menor número de horas de sono do período: a última noite com esse valor e quantas vezes ele aconteceu.
function piorNoite(noites) {
  if (!noites.length) return null
  const menor = Math.min(...noites.map((c) => c.sonoHoras))
  const iguais = noites.filter((c) => c.sonoHoras === menor)
  return { ...iguais.at(-1), vezes: iguais.length }
}

// Registros de um período: `dias` dias terminando em `ate` (AAAA-MM-DD, inclusive).
export function noPeriodo({ pressoes, checkins, sintomas }, dias, ate = hojeISO()) {
  const desde = somarDias(ate, -(dias - 1))
  const dentro = (dia) => dia >= desde && dia <= ate
  return {
    desde,
    pressoes: pressoes.filter((p) => dentro(p.medidoEm.slice(0, 10))),
    checkins: checkins.filter((c) => dentro(c.data)),
    sintomas: sintomas.filter((s) => dentro(s.ocorridoEm.slice(0, 10))),
  }
}

export function resumirPeriodo({ perfil, config, pressoes, pesagens, checkins, sintomas, dias, ate = hojeISO() }) {
  const { pressoes: pa, checkins: ci, sintomas: si } = noPeriodo({ pressoes, checkins, sintomas }, dias, ate)

  const pesoAtual = pesagens.at(-1) ?? null
  const idade = calcularIdade(perfil.dataNascimento)
  const imc = pesoAtual ? avaliarImc(pesoAtual.pesoKg, perfil.alturaCm, idade) : null

  const respondidos = (campo) => ci.filter((c) => c[campo] !== null && c[campo] !== undefined)
  const habito = (campo) => ({ sim: contar(ci, (c) => c[campo] === true), respondidos: respondidos(campo).length })
  const podeMedia = config.mostrarMediasPressao && pa.length >= MIN_MEDICOES_PARA_MEDIA

  // Inatividade conta a partir do último registro (ou do cadastro, para quem ainda não registrou nada).
  const ultimas = [pressoes.at(-1)?.medidoEm, checkins.at(-1)?.data, sintomas.at(-1)?.ocorridoEm].filter(Boolean).sort()
  const ultimoRegistro = ultimas.at(-1) ?? null
  const referencia = (ultimoRegistro ?? perfil.criadoEm).slice(0, 10)
  const diasSemRegistro = diasEntre(referencia, hojeISO())
  const cigarros = respondidos('cigarros').map((c) => c.cigarros)

  return {
    dias,
    idade,
    pesoAtual,
    imc,
    ultimaPressao: pressoes.at(-1) ?? null,
    medicoesPressao: pa.length,
    pressoesForaDoPadrao: pa.filter((p) => foraDoPadrao(p, config.limitesPressao)),
    pressoesMuitoAltas: pa.filter((p) => classificarPressao(p, config.limitesPressao) === 'muitoAlta'),
    podeMedia,
    mediaPressao: podeMedia
      ? { sistolica: Math.round(media(pa.map((p) => p.sistolica))), diastolica: Math.round(media(pa.map((p) => p.diastolica))) }
      : null,
    diasComCheckin: ci.length,
    sonoMedio: media(respondidos('sonoHoras').map((c) => c.sonoHoras)),
    piorNoite: piorNoite(respondidos('sonoHoras')),
    estresseMedio: media(respondidos('estresse').map((c) => c.estresse)),
    diasEstresseAlto: contar(ci, (c) => estresseAlto(c.estresse)),
    cigarrosTotal: cigarros.length ? cigarros.reduce((s, v) => s + v, 0) : null,
    cigarrosMedia: media(cigarros),
    diasComCigarros: cigarros.length,
    alcool: habito('alcool'),
    atividade: { ...habito('atividade'), minutos: ci.reduce((s, c) => s + (c.atividadeMinutos ?? 0), 0) },
    alimentacao: {
      ultraprocessados: habito('ultraprocessados'),
      salgados: habito('salgados'),
      frutasVerduras: habito('frutasVerduras'),
    },
    sintomas: si,
    sintomasGraves: si.filter((s) => s.grave),
    ultimoRegistro,
    diasSemRegistro,
    inativo: diasSemRegistro >= DIAS_PARA_INATIVO,
  }
}

// Sinais para a lista de pacientes e o topo da ficha (tabela de alertas da especificação).
// grave: sintoma grave · atencao: fora do padrão · informativo: IMC · pendente: acesso ou registros.
export function sinaisDeAtencao(resumo, { consentiu, situacao }) {
  const sinais = []
  if (!consentiu) sinais.push({ tipo: 'pendente', texto: 'Aguardando primeiro acesso' })
  if (situacao !== 'ativo') return sinais
  if (resumo.sintomasGraves.length) {
    sinais.push({ tipo: 'grave', texto: `Sintoma grave declarado (${resumo.sintomasGraves.length})` })
  }
  if (resumo.pressoesMuitoAltas.length) {
    sinais.push({ tipo: 'grave', texto: `${plural(resumo.pressoesMuitoAltas.length, 'medição', 'medições')} a partir de ${PRESSAO_MUITO_ALTA.sistolica}/${PRESSAO_MUITO_ALTA.diastolica}` })
  }
  if (resumo.pressoesForaDoPadrao.length) {
    sinais.push({ tipo: 'atencao', texto: `${plural(resumo.pressoesForaDoPadrao.length, 'medição', 'medições')} fora do padrão cadastrado` })
  }
  if (resumo.imc?.atencao) sinais.push({ tipo: 'informativo', texto: 'IMC na faixa de obesidade' })
  if (consentiu && resumo.inativo) {
    sinais.push({ tipo: 'pendente', texto: `Inativo · sem registros há ${resumo.diasSemRegistro} dias` })
  }
  return sinais
}

// ---------------------------------------------------------------------------
// Síntese: contexto de cada dia, cruzamentos e frases descritivas
// ---------------------------------------------------------------------------

// Tudo o que foi registrado num dia, para olhar um sintoma junto do resto.
export function contextoDoDia(data, { checkins, pressoes }, limites) {
  const c = checkins.find((x) => x.data === data) ?? null
  const pa = pressoes.filter((p) => p.medidoEm.slice(0, 10) === data)
  return {
    checkin: c,
    pressoes: pa.map((p) => ({ ...p, situacao: classificarPressao(p, limites) })),
  }
}

// Fatores que dá para cruzar: cada um divide os dias do período em "com" e "sem".
export const FATORES = [
  { chave: 'estresse', rotulo: `Estresse acima de ${LIMITE_ESTRESSE}`, teste: (c) => (c.estresse === null || c.estresse === undefined ? null : estresseAlto(c.estresse)) },
  { chave: 'sono', rotulo: `Dormiu menos de ${SONO_CURTO} h`, teste: (c) => (c.sonoHoras === null || c.sonoHoras === undefined ? null : c.sonoHoras < SONO_CURTO) },
  { chave: 'atividade', rotulo: 'Fez atividade física', teste: (c) => c.atividade ?? null },
  { chave: 'alcool', rotulo: 'Consumiu álcool', teste: (c) => c.alcool ?? null },
  { chave: 'salgados', rotulo: 'Comeu muito salgado', teste: (c) => c.salgados ?? null },
  { chave: 'ultraprocessados', rotulo: 'Comeu ultraprocessados', teste: (c) => c.ultraprocessados ?? null },
]

const MIN_DIAS_GRUPO = 3

// Para cada fator: em quantos dias "com" e "sem" houve sintoma e, se a médica permitir médias,
// a sistólica média registrada em cada grupo. Grupos com menos de 3 dias não são comparados.
export function cruzarFatores({ checkins, pressoes, sintomas }, { mostrarMedias }) {
  const diasComSintoma = new Set(sintomas.map((s) => s.ocorridoEm.slice(0, 10)))
  const pressoesDoDia = (data) => pressoes.filter((p) => p.medidoEm.slice(0, 10) === data)

  return FATORES.map((f) => {
    const grupos = { com: [], sem: [] }
    for (const c of checkins) {
      const r = f.teste(c)
      if (r !== null) grupos[r ? 'com' : 'sem'].push(c.data)
    }
    const descrever = (datas) => {
      const pa = datas.flatMap(pressoesDoDia)
      return {
        dias: datas.length,
        diasComSintoma: datas.filter((d) => diasComSintoma.has(d)).length,
        sistolicaMedia: mostrarMedias && pa.length >= MIN_DIAS_GRUPO ? Math.round(media(pa.map((p) => p.sistolica))) : null,
      }
    }
    const com = descrever(grupos.com)
    const sem = descrever(grupos.sem)
    return { ...f, com, sem, comparavel: com.dias >= MIN_DIAS_GRUPO && sem.dias >= MIN_DIAS_GRUPO }
  })
}

// Frases que destacam as maiores diferenças entre "com" e "sem" — sempre como coincidência.
export function frasesDosCruzamentos(cruzamentos) {
  const frases = []
  for (const c of cruzamentos.filter((x) => x.comparavel)) {
    const taxaCom = pct(c.com.diasComSintoma, c.com.dias)
    const taxaSem = pct(c.sem.diasComSintoma, c.sem.dias)
    if (c.com.diasComSintoma >= 2 && taxaCom >= taxaSem + 15) {
      frases.push(
        `Sintomas apareceram em ${c.com.diasComSintoma} de ${c.com.dias} dias com “${c.rotulo.toLowerCase()}” (${taxaCom}%), contra ${c.sem.diasComSintoma} de ${c.sem.dias} nos demais dias (${taxaSem}%).`,
      )
    }
    if (c.com.sistolicaMedia !== null && c.sem.sistolicaMedia !== null && Math.abs(c.com.sistolicaMedia - c.sem.sistolicaMedia) >= 5) {
      frases.push(
        `Nos dias com “${c.rotulo.toLowerCase()}”, a sistólica média registrada foi ${c.com.sistolicaMedia} mmHg; nos demais, ${c.sem.sistolicaMedia} mmHg.`,
      )
    }
  }
  return frases
}

// Destaques do período para o topo da Síntese: o que a médica deveria ver primeiro.
export function destaquesDoPeriodo(resumo, config) {
  const d = []
  const l = config.limitesPressao
  if (resumo.sintomasGraves.length) {
    d.push({ tipo: 'grave', texto: `${plural(resumo.sintomasGraves.length, 'relato', 'relatos')} de sintoma potencialmente grave — o paciente recebeu a orientação de emergência na hora.` })
  }
  if (resumo.pressoesMuitoAltas.length) {
    d.push({ tipo: 'grave', texto: `${plural(resumo.pressoesMuitoAltas.length, 'medição', 'medições')} a partir de ${PRESSAO_MUITO_ALTA.sistolica}/${PRESSAO_MUITO_ALTA.diastolica} mmHg.` })
  }
  if (resumo.medicoesPressao) {
    d.push({
      tipo: resumo.pressoesForaDoPadrao.length ? 'atencao' : 'informativo',
      texto: `${resumo.pressoesForaDoPadrao.length} de ${resumo.medicoesPressao} medições de pressão fora do padrão cadastrado (a partir de ${l.sistolicaMax}/${l.diastolicaMax} ou abaixo de ${l.sistolicaMin}/${l.diastolicaMin}).`,
    })
  }
  if (resumo.diasEstresseAlto) {
    d.push({ tipo: 'atencao', texto: `Estresse acima de ${LIMITE_ESTRESSE} em ${plural(resumo.diasEstresseAlto, 'dia', 'dias')}.` })
  }
  if (resumo.inativo) d.push({ tipo: 'pendente', texto: `Sem registros há ${resumo.diasSemRegistro} dias.` })
  return d
}

// Frases por tema, para a Síntese.
export function frasesPorTema(resumo) {
  const temas = { pressao: [], corpo: [], habitos: [] }
  if (resumo.mediaPressao) temas.pressao.push(`Média registrada no período: ${resumo.mediaPressao.sistolica}/${resumo.mediaPressao.diastolica} mmHg.`)
  else if (resumo.medicoesPressao) temas.pressao.push('Médias e comparações de pressão estão desligadas — ligue na Configuração quando o protocolo de medição estiver combinado.')
  if (resumo.ultimaPressao) {
    temas.pressao.push(`Última medição: ${resumo.ultimaPressao.sistolica}/${resumo.ultimaPressao.diastolica} mmHg em ${formatarDia(resumo.ultimaPressao.medidoEm)}.`)
  }
  if (resumo.pesoAtual && resumo.imc) {
    temas.corpo.push(
      `Peso mais recente: ${formatarNumero(resumo.pesoAtual.pesoKg)} kg (IMC ${formatarNumero(resumo.imc.valor)}${resumo.imc.classificacao ? ` · ${resumo.imc.classificacao}` : ''}).`,
    )
  }
  if (resumo.sonoMedio !== null) {
    temas.corpo.push(
      `Sono médio declarado: ${formatarNumero(resumo.sonoMedio)} h por noite; pior noite: ${formatarNumero(resumo.piorNoite.sonoHoras)} h${resumo.piorNoite.vezes > 1 ? ` (${resumo.piorNoite.vezes} noites, a última em ${formatarDia(resumo.piorNoite.data)})` : ` em ${formatarDia(resumo.piorNoite.data)}`}.`,
    )
  }
  if (resumo.estresseMedio !== null) temas.corpo.push(`Estresse médio declarado: ${formatarNumero(resumo.estresseMedio)}/10.`)
  if (resumo.cigarrosTotal !== null) {
    temas.habitos.push(`${resumo.cigarrosTotal} cigarros declarados no período — média de ${formatarNumero(resumo.cigarrosMedia)} por dia respondido.`)
  }
  const habito = (h, texto) => h.respondidos && temas.habitos.push(`${texto} em ${h.sim} de ${resumo.dias} dias (${pct(h.sim, resumo.dias)}% do período).`)
  habito(resumo.alcool, 'Álcool')
  if (resumo.atividade.respondidos) {
    temas.habitos.push(`Atividade física em ${resumo.atividade.sim} de ${resumo.dias} dias (${pct(resumo.atividade.sim, resumo.dias)}%), somando ${resumo.atividade.minutos} minutos.`)
  }
  habito(resumo.alimentacao.salgados, 'Alimentos muito salgados')
  habito(resumo.alimentacao.ultraprocessados, 'Ultraprocessados')
  habito(resumo.alimentacao.frutasVerduras, 'Frutas, verduras ou legumes')
  return temas
}

export const porcentagem = pct
