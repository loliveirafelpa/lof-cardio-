import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, Apple, BedDouble, Brain, CheckCircle2, Cigarette, Gauge, Scale, Stethoscope } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { buscarConfiguracao } from '../../lib/configuracoesApi'
import { buscarCheckin, listarPesagens, listarPressoes, salvarCheckinCompleto } from '../../lib/registrosApi'
import { avaliarImc, calcularIdade, formatarImc } from '../../lib/imc'
import { diaISO, diasAtrasISO, formatarDiaLongo, formatarHora, hojeISO, paraCampoDataHora } from '../../lib/datas'
import { CONTEXTOS_SINTOMA, NIVEIS_ESFORCO, PERGUNTAS_ALIMENTACAO, QUALIDADE_SONO, SINTOMAS } from '../../data/checkinOpcoes'
import { Escala, EscolhaMultipla, EscolhaUnica, Pergunta, SimNao } from '../../components/Escolhas'
import AvisoEmergencia from '../../components/AvisoEmergencia'
import Bloco from '../../components/Bloco'
import Botao, { BotaoLink } from '../../components/Botao'
import Campo from '../../components/Campo'
import Pagina, { Destaque } from '../../components/Pagina'

// Check-in do dia, montado só com os módulos que a cardiologista ativou para este paciente.
// Tudo é opcional: o paciente responde o que quiser e salva de uma vez.
// Com ?dia=AAAA-MM-DD, ajusta o check-in de um dia anterior (dentro dos dias que o histórico mostra).
const VAZIO = {
  sonoHoras: '',
  sonoQualidade: null,
  cigarros: '',
  vapeMinutos: '',
  alcool: null,
  atividade: null,
  esforco: null,
  atividadeMinutos: '',
  estresse: null,
  ultraprocessados: null,
  salgados: null,
  frutasVerduras: null,
}

// Mesmo período do histórico: dá para ajustar o que o paciente consegue ver lá.
const DIAS_EDITAVEIS = 30

const diaEscolhido = (valor, hoje) =>
  /^\d{4}-\d{2}-\d{2}$/.test(valor ?? '') && valor <= hoje && valor >= diasAtrasISO(DIAS_EDITAVEIS - 1) ? valor : hoje

const numeroOuNulo = (v) => (v === '' || v === null || v === undefined ? null : Number(String(v).replace(',', '.')))

export default function Checkin() {
  const [params] = useSearchParams()
  const dia = diaEscolhido(params.get('dia'), hojeISO())
  // A chave recomeça o formulário do zero ao trocar de dia (ex.: do histórico para o check-in de hoje).
  return <FormularioCheckin key={dia} dia={dia} />
}

function FormularioCheckin({ dia }) {
  const { perfil } = useAuth()
  const hoje = hojeISO()
  const ehHoje = dia === hoje
  const quando = ehHoje ? 'hoje' : 'neste dia'
  const [carregado, setCarregado] = useState(null)
  const [respostas, setRespostas] = useState(VAZIO)
  const [pressao, setPressao] = useState({ sistolica: '', diastolica: '', medidoEm: ehHoje ? paraCampoDataHora() : `${dia}T12:00`, emRepouso: null, aparelho: '' })
  const [peso, setPeso] = useState('')
  const [sintoma, setSintoma] = useState({ teve: null, lista: [], outro: '', contexto: '', hora: '', duracao: '' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    Promise.all([buscarConfiguracao(perfil.id), buscarCheckin(perfil.id, dia), listarPesagens(perfil.id), listarPressoes(perfil.id, dia)]).then(
      ([config, existente, pesagens, pressoes]) => {
        const pressoesHoje = pressoes.filter((p) => diaISO(new Date(p.medidoEm)) === dia)
        setCarregado({ config, existente, pesoAtual: pesagens.at(-1), pressoesHoje })
        if (existente) {
          const r = { ...VAZIO }
          for (const k of Object.keys(VAZIO)) r[k] = existente[k] ?? VAZIO[k]
          setRespostas(r)
        }
        const ultimoAparelho = pressoesHoje.at(-1)?.aparelho
        if (ultimoAparelho) setPressao((p) => ({ ...p, aparelho: ultimoAparelho }))
      },
    )
  }, [perfil.id, dia])

  const responder = (campo) => (valor) => setRespostas((r) => ({ ...r, [campo]: valor }))

  if (!carregado) {
    return (
      <Pagina sobretitulo="Check-in" titulo="Carregando…">
        <span />
      </Pagina>
    )
  }

  const { config, existente, pesoAtual, pressoesHoje } = carregado
  const m = config.modulos
  const idade = calcularIdade(perfil.dataNascimento)
  const pesoNovo = numeroOuNulo(peso)
  const imcNovo = pesoNovo ? avaliarImc(pesoNovo, perfil.alturaCm, idade) : null
  const graves = sintoma.lista.filter((v) => SINTOMAS.find((s) => s.valor === v)?.grave)

  async function salvar() {
    setErro('')
    const sis = numeroOuNulo(pressao.sistolica)
    const dias = numeroOuNulo(pressao.diastolica)
    if ((sis === null) !== (dias === null)) return setErro('Para registrar a pressão, preencha os dois números (sistólica e diastólica).')
    if (sis !== null && (sis < 60 || sis > 260 || dias < 30 || dias > 160 || dias >= sis)) {
      return setErro('Confira os números da pressão: o primeiro (sistólica) é o maior, por exemplo 120/80.')
    }
    if (pesoNovo !== null && (pesoNovo < 25 || pesoNovo > 350)) return setErro('Confira o peso informado, em quilos.')
    const horas = numeroOuNulo(respostas.sonoHoras)
    if (horas !== null && (horas < 0 || horas > 24)) return setErro('As horas de sono precisam estar entre 0 e 24.')
    if (sintoma.teve && !sintoma.lista.length) return setErro('Marque qual sintoma você sentiu, ou responda “Não”.')

    setSalvando(true)
    try {
      await salvarCheckinCompleto(perfil.id, {
        data: dia,
        checkin: {
          ...respostas,
          // Ajuste feito depois do dia fica marcado, para a médica saber que o registro foi revisto.
          ...(!ehHoje && existente && { editadoEm: new Date().toISOString() }),
          sonoHoras: horas,
          cigarros: numeroOuNulo(respostas.cigarros),
          vapeMinutos: numeroOuNulo(respostas.vapeMinutos),
          esforco: respostas.atividade ? respostas.esforco : null,
          atividadeMinutos: respostas.atividade ? numeroOuNulo(respostas.atividadeMinutos) : null,
        },
        pressao: sis !== null && {
          medidoEm: new Date(pressao.medidoEm).toISOString(),
          sistolica: sis,
          diastolica: dias,
          emRepouso: pressao.emRepouso,
          aparelho: pressao.aparelho.trim(),
        },
        pesagem: pesoNovo !== null && { medidoEm: dia, pesoKg: pesoNovo, alturaCm: perfil.alturaCm },
        sintoma: sintoma.teve &&
          sintoma.lista.length > 0 && {
            ocorridoEm: new Date(`${dia}T${sintoma.hora || (ehHoje ? formatarHora(new Date()) : '12:00')}:00`).toISOString(),
            sintomas: sintoma.lista,
            outro: sintoma.outro.trim(),
            contexto: sintoma.contexto.trim(),
            duracao: sintoma.duracao.trim(),
            grave: graves.length > 0,
          },
      })
      setSalvo(true)
      window.scrollTo(0, 0)
    } catch {
      setErro('Não foi possível salvar agora. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (salvo) {
    return (
      <Pagina sobretitulo={formatarDiaLongo(dia)} titulo={<>Check-in <Destaque>{ehHoje ? 'salvo' : 'atualizado'}</Destaque></>}>
        <Bloco>
          <p className="flex items-center gap-2 font-interface font-semibold text-carmim">
            <CheckCircle2 size={20} aria-hidden /> Obrigado por registrar.
          </p>
          <p className="text-sm text-textoSecundario">Sua cardiologista vai ver estas informações no acompanhamento. Elas não são analisadas em tempo real.</p>
          {graves.length > 0 && <AvisoEmergencia destaque />}
          <div className="flex flex-wrap gap-3">
            <BotaoLink to="/app">Voltar ao início</BotaoLink>
            <BotaoLink variante="secundario" to="/app/historico?aba=dias">Ver meu histórico</BotaoLink>
          </div>
        </Bloco>
      </Pagina>
    )
  }

  return (
    <Pagina
      sobretitulo={formatarDiaLongo(dia)}
      titulo={ehHoje ? <>Check-in de <Destaque>hoje</Destaque></> : <>Ajustar <Destaque>check-in</Destaque></>}
      descricao={
        !ehHoje
          ? 'Corrija ou complete o que registrou neste dia. A cardiologista verá a versão atualizada, marcada como ajustada.'
          : existente
            ? 'Você já registrou hoje. Pode ajustar o que quiser e salvar de novo.'
            : 'Responda o que fizer sentido para o seu dia. Tudo é opcional.'
      }
    >
      {m.pressao && (
        <Bloco titulo="Pressão arterial" icone={<Gauge size={15} />}>
          {pressoesHoje.length > 0 && (
            <p className="text-sm text-textoSecundario">
              {ehHoje ? 'Hoje' : 'Neste dia'} você já registrou: {pressoesHoje.map((p) => `${p.sistolica}/${p.diastolica} às ${formatarHora(p.medidoEm)}`).join(' · ')}. Pode adicionar outra medição.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Sistólica (maior)" id="sis" inputMode="numeric" placeholder="ex.: 120" value={pressao.sistolica} onChange={(e) => setPressao({ ...pressao, sistolica: e.target.value })} ajuda="mmHg" />
            <Campo rotulo="Diastólica (menor)" id="dia" inputMode="numeric" placeholder="ex.: 80" value={pressao.diastolica} onChange={(e) => setPressao({ ...pressao, diastolica: e.target.value })} ajuda="mmHg" />
          </div>
          <Campo rotulo="Data e horário da medição" id="quando" type="datetime-local" value={pressao.medidoEm} onChange={(e) => setPressao({ ...pressao, medidoEm: e.target.value })} />
          <Pergunta titulo="Você estava em repouso?" ajuda="Opcional">
            <SimNao valor={pressao.emRepouso} aoMudar={(v) => setPressao({ ...pressao, emRepouso: v })} />
          </Pergunta>
          <Campo rotulo="Aparelho usado (opcional)" id="aparelho" placeholder="ex.: digital de braço" value={pressao.aparelho} onChange={(e) => setPressao({ ...pressao, aparelho: e.target.value })} />
        </Bloco>
      )}

      {m.peso && (
        <Bloco titulo="Peso" icone={<Scale size={15} />}>
          <Campo
            rotulo={`Se você se pesou ${quando}, quanto deu?`}
            id="peso"
            inputMode="decimal"
            placeholder={pesoAtual ? `último: ${String(pesoAtual.pesoKg).replace('.', ',')} kg` : 'ex.: 72,5'}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            ajuda="Em quilos. Deixe em branco se não se pesou."
          />
          {imcNovo && (
            <p className="rounded-xl bg-papel px-4 py-3 text-sm">
              Com esse peso, seu IMC fica em <strong>{formatarImc(imcNovo.valor)}</strong>
              {imcNovo.classificacao && <> ({imcNovo.classificacao})</>}.
              {imcNovo.atencao && <span className="mt-1 block font-semibold text-atencao">IMC na faixa de obesidade — conversar com sua médica.</span>}
            </p>
          )}
        </Bloco>
      )}

      {m.sono && (
        <Bloco titulo="Sono" icone={<BedDouble size={15} />}>
          <Campo rotulo={`Quantas horas você dormiu na ${ehHoje ? 'última noite' : 'noite anterior a este dia'}?`} id="sono" inputMode="decimal" placeholder="ex.: 7" value={respostas.sonoHoras ?? ''} onChange={(e) => responder('sonoHoras')(e.target.value)} />
          <Pergunta titulo="Como avalia a qualidade do seu sono?">
            <EscolhaUnica opcoes={QUALIDADE_SONO} valor={respostas.sonoQualidade} aoMudar={responder('sonoQualidade')} />
          </Pergunta>
        </Bloco>
      )}

      {m.tabagismo && (
        <Bloco titulo="Tabagismo" icone={<Cigarette size={15} />}>
          {config.tabagismoTipo !== 'eletronico' && (
            <Campo rotulo={`Quantos cigarros você fumou ${quando}?`} id="cigarros" inputMode="numeric" placeholder="ex.: 0" value={respostas.cigarros ?? ''} onChange={(e) => responder('cigarros')(e.target.value)} />
          )}
          {config.tabagismoTipo !== 'convencional' && (
            <Campo rotulo={`Por quanto tempo, mais ou menos, usou o cigarro eletrônico ${quando}?`} id="vape" inputMode="numeric" placeholder="em minutos" value={respostas.vapeMinutos ?? ''} onChange={(e) => responder('vapeMinutos')(e.target.value)} ajuda="Uma estimativa já ajuda." />
          )}
        </Bloco>
      )}

      {(m.alcool || m.atividade) && (
        <Bloco titulo="Hábitos do dia" icone={<Activity size={15} />}>
          {m.alcool && (
            <Pergunta titulo={`Você consumiu bebida alcoólica ${quando}?`}>
              <SimNao valor={respostas.alcool} aoMudar={responder('alcool')} />
            </Pergunta>
          )}
          {m.atividade && (
            <Pergunta titulo={`Você realizou atividade física ${quando}?`}>
              <SimNao valor={respostas.atividade} aoMudar={responder('atividade')} />
              {respostas.atividade && (
                <div className="mt-5 space-y-5 border-l-2 border-blush pl-4">
                  <Pergunta titulo="Qual foi o nível de esforço percebido?">
                    <EscolhaUnica colunas={3} opcoes={NIVEIS_ESFORCO} valor={respostas.esforco} aoMudar={responder('esforco')} />
                  </Pergunta>
                  <Campo rotulo="Por quantos minutos? (opcional)" id="minutos" inputMode="numeric" placeholder="ex.: 30" value={respostas.atividadeMinutos ?? ''} onChange={(e) => responder('atividadeMinutos')(e.target.value)} />
                </div>
              )}
            </Pergunta>
          )}
        </Bloco>
      )}

      {m.estresse && (
        <Bloco titulo="Estresse" icone={<Brain size={15} />}>
          <Pergunta titulo={`Qual foi seu nível de estresse ${quando}?`}>
            <Escala id="estresse" valor={respostas.estresse} aoMudar={responder('estresse')} rotuloMin="Nada estressante" rotuloMax="Muito estressante" />
          </Pergunta>
        </Bloco>
      )}

      {m.sintomas && (
        <Bloco titulo="Sintomas" icone={<Stethoscope size={15} />}>
          <Pergunta titulo={`Você sentiu algum sintoma ${quando}?`}>
            <SimNao valor={sintoma.teve} aoMudar={(v) => setSintoma({ ...sintoma, teve: v })} />
          </Pergunta>
          {sintoma.teve && (
            <>
              <Pergunta titulo="Quais?" ajuda="Pode marcar mais de um.">
                <EscolhaMultipla opcoes={SINTOMAS} valores={sintoma.lista} aoMudar={(lista) => setSintoma({ ...sintoma, lista })} />
              </Pergunta>
              {graves.length > 0 && <AvisoEmergencia destaque />}
              {sintoma.lista.includes('outro') && (
                <Campo rotulo="Qual outro sintoma?" id="outro" value={sintoma.outro} onChange={(e) => setSintoma({ ...sintoma, outro: e.target.value })} />
              )}
              {sintoma.lista.length > 0 && (
                <div className="space-y-5 border-l-2 border-blush pl-4">
                  <div>
                    <Campo
                      rotulo="O que você estava fazendo quando percebeu esse sintoma?"
                      id="contexto"
                      multilinha
                      value={sintoma.contexto}
                      onChange={(e) => setSintoma({ ...sintoma, contexto: e.target.value })}
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {CONTEXTOS_SINTOMA.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSintoma({ ...sintoma, contexto: sintoma.contexto ? `${sintoma.contexto}, ${c.toLowerCase()}` : c })}
                          className="rounded-full border border-borda px-3 py-1 text-xs text-textoSecundario hover:border-rosado hover:text-texto"
                        >
                          + {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Campo rotulo="Horário aproximado" id="hora" type="time" value={sintoma.hora} onChange={(e) => setSintoma({ ...sintoma, hora: e.target.value })} />
                    <Campo rotulo="Quanto tempo durou?" id="duracao" placeholder="ex.: 5 minutos" value={sintoma.duracao} onChange={(e) => setSintoma({ ...sintoma, duracao: e.target.value })} />
                  </div>
                </div>
              )}
            </>
          )}
        </Bloco>
      )}

      {m.alimentacao && config.alimentacaoPerguntas.length > 0 && (
        <Bloco titulo="Alimentação" icone={<Apple size={15} />}>
          {PERGUNTAS_ALIMENTACAO.filter((p) => config.alimentacaoPerguntas.includes(p.chave)).map((p) => (
            <Pergunta key={p.chave} titulo={p.rotulo}>
              <SimNao valor={respostas[p.chave]} aoMudar={responder(p.chave)} />
            </Pergunta>
          ))}
        </Bloco>
      )}

      <Bloco>
        {erro && <p className="text-sm text-alerta" role="alert">{erro}</p>}
        <Botao onClick={salvar} disabled={salvando} className="w-full py-3">
          {salvando ? 'Salvando…' : existente ? 'Salvar ajustes' : 'Salvar check-in'}
        </Botao>
      </Bloco>
    </Pagina>
  )
}
