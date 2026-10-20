import { useEffect, useState } from 'react'
import { History, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '../../../lib/AuthContext'
import { listarHistoricoConfiguracao, registrarNoHistorico, salvarConfiguracao } from '../../../lib/configuracoesApi'
import { atualizarPerfil } from '../../../lib/perfisApi'
import { formatarDiaHora } from '../../../lib/datas'
import { FREQUENCIAS, MODULOS, PERGUNTAS_ALIMENTACAO, TIPOS_TABAGISMO } from '../../../data/checkinOpcoes'
import { EscolhaUnica, Interruptor, Pergunta } from '../../../components/Escolhas'
import Bloco from '../../../components/Bloco'
import Botao from '../../../components/Botao'
import Campo from '../../../components/Campo'

const DESCRICOES = {
  pressao: 'Sistólica, diastólica, horário, repouso e aparelho.',
  peso: 'Cada nova pesagem recalcula o IMC.',
  sono: 'Horas dormidas e qualidade percebida.',
  tabagismo: 'Cigarros por dia e/ou tempo de cigarro eletrônico.',
  alcool: 'Sim ou não, sem quantidade.',
  atividade: 'Sim ou não, esforço percebido e minutos.',
  estresse: 'Escala de 0 a 10.',
  sintomas: 'Com contexto, horário e duração. Sintoma grave mostra orientação de emergência.',
  alimentacao: 'Perguntas rápidas de sim ou não.',
}

const SITUACOES = [
  { valor: 'ativo', rotulo: 'Ativo' },
  { valor: 'suspenso', rotulo: 'Suspenso' },
  { valor: 'encerrado', rotulo: 'Encerrado' },
]

// Configuração individual do acompanhamento. Toda alteração fica registrada com autor, data e hora.
export default function Configuracao({ perfil, config, aoMudar }) {
  const { perfil: medica } = useAuth()
  const [c, setC] = useState(structuredClone(config))
  const [historico, setHistorico] = useState([])
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    listarHistoricoConfiguracao(perfil.id).then(setHistorico)
  }, [perfil.id, config])

  const alterado = JSON.stringify(c) !== JSON.stringify(config)
  const modulo = (chave) => (v) => setC({ ...c, modulos: { ...c.modulos, [chave]: v } })
  const limite = (chave) => ({
    id: chave,
    inputMode: 'numeric',
    value: c.limitesPressao[chave],
    onChange: (e) => setC({ ...c, limitesPressao: { ...c.limitesPressao, [chave]: Number(e.target.value) || 0 } }),
  })

  async function salvar() {
    setErro('')
    const l = c.limitesPressao
    if (!(l.sistolicaMin < l.sistolicaMax && l.diastolicaMin < l.diastolicaMax)) return setErro('Confira os limites de pressão: o mínimo precisa ser menor que o máximo.')
    await salvarConfiguracao(perfil.id, c, medica.nome)
    setAviso('Configuração salva. O check-in do paciente já segue as novas escolhas.')
    aoMudar()
  }

  async function mudarSituacao(situacao) {
    if (!situacao || situacao === perfil.situacao) return
    await atualizarPerfil(perfil.id, { situacao })
    const frase = { ativo: 'Reativou o acompanhamento.', suspenso: 'Suspendeu o acompanhamento.', encerrado: 'Encerrou o acompanhamento.' }[situacao]
    await registrarNoHistorico(perfil.id, frase, medica.nome)
    aoMudar()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
      <div className="space-y-5">
        <Bloco titulo="Módulos do check-in" icone={<SlidersHorizontal size={15} />}>
          <div className="-my-3 divide-y divide-borda">
            {MODULOS.map((mod) => (
              <div key={mod.chave}>
                <Interruptor rotulo={mod.rotulo} descricao={DESCRICOES[mod.chave]} ligado={c.modulos[mod.chave]} aoMudar={modulo(mod.chave)} />
                {mod.chave === 'tabagismo' && c.modulos.tabagismo && (
                  <div className="pb-4">
                    <EscolhaUnica opcoes={TIPOS_TABAGISMO} valor={c.tabagismoTipo} aoMudar={(v) => v && setC({ ...c, tabagismoTipo: v })} />
                  </div>
                )}
                {mod.chave === 'alimentacao' && c.modulos.alimentacao && (
                  <div className="space-y-2 pb-4">
                    {PERGUNTAS_ALIMENTACAO.map((p) => (
                      <label key={p.chave} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-carmim"
                          checked={c.alimentacaoPerguntas.includes(p.chave)}
                          onChange={(e) =>
                            setC({
                              ...c,
                              alimentacaoPerguntas: e.target.checked ? [...c.alimentacaoPerguntas, p.chave] : c.alimentacaoPerguntas.filter((x) => x !== p.chave),
                            })
                          }
                        />
                        {p.rotulo}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Bloco>

        <Bloco titulo="Frequência e pressão">
          <Pergunta titulo="Com que frequência o paciente deve registrar?">
            <EscolhaUnica opcoes={FREQUENCIAS} valor={c.frequencia} aoMudar={(v) => v && setC({ ...c, frequencia: v })} />
          </Pergunta>
          <Pergunta
            titulo="Limites para destacar medições de pressão"
            ajuda="Medições a partir do máximo (ex.: 130 ou 90) ou abaixo do mínimo (ex.: menos de 50 na diastólica) ganham um destaque no gráfico, para conferência. A partir de 180/110 (estágio 3 da Diretriz Brasileira de Hipertensão) o destaque é fixo e diferente. Nada disso gera alerta ao paciente nem diagnóstico."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Campo rotulo="Sistólica · a partir de" {...limite('sistolicaMax')} />
              <Campo rotulo="Diastólica · a partir de" {...limite('diastolicaMax')} />
              <Campo rotulo="Sistólica · abaixo de" {...limite('sistolicaMin')} />
              <Campo rotulo="Diastólica · abaixo de" {...limite('diastolicaMin')} />
            </div>
          </Pergunta>
          <Interruptor
            rotulo="Mostrar médias de pressão"
            descricao="Ligue quando o protocolo de medição estiver combinado com o paciente. As médias só aparecem com 7 ou mais medições no período."
            ligado={c.mostrarMediasPressao}
            aoMudar={(v) => setC({ ...c, mostrarMediasPressao: v })}
          />
        </Bloco>

        {alterado ? (
          <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-noite/95 p-3 shadow-cartao">
            <Botao onClick={salvar}>Salvar configuração</Botao>
            <Botao variante="discreto" className="text-branco" onClick={() => setC(structuredClone(config))}>Descartar</Botao>
            {erro && <p className="text-sm text-rosado" role="alert">{erro}</p>}
          </div>
        ) : (
          aviso && <p className="text-sm text-carmim" role="status">{aviso}</p>
        )}
      </div>

      <div className="space-y-5">
        <Bloco titulo="Situação do acompanhamento">
          <EscolhaUnica colunas={3} opcoes={SITUACOES} valor={perfil.situacao} aoMudar={mudarSituacao} />
          <p className="text-xs text-textoSecundario">Suspenso ou encerrado: o paciente sai da lista principal. Nada é apagado.</p>
        </Bloco>

        <Bloco titulo="Histórico de alterações" icone={<History size={15} />}>
          <ul className="space-y-3">
            {historico.map((h) => (
              <li key={h.id} className="border-l-2 border-blush pl-3 text-sm">
                <p>{h.descricao}</p>
                <p className="text-xs text-textoSecundario">{formatarDiaHora(h.alteradoEm)} · {h.autor}</p>
              </li>
            ))}
          </ul>
        </Bloco>
      </div>
    </div>
  )
}
