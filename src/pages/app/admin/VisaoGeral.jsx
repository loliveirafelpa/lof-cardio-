import { useEffect, useState } from 'react'
import { Activity, ClipboardList, Gauge, LineChart, Stethoscope } from 'lucide-react'
import { listarExames, listarMedicamentos } from '../../../lib/clinicoApi'
import { classificarPressao, estresseAlto, foraDoPadrao, LIMITE_ESTRESSE, MIN_MEDICOES_PARA_MEDIA, nomeDoSintoma, PRESSAO_MUITO_ALTA } from '../../../lib/resumo'
import { formatarImc } from '../../../lib/imc'
import { diasAtrasISO, formatarDia, formatarDiaHora, formatarNumero, hojeISO } from '../../../lib/datas'
import { PERGUNTAS_ALIMENTACAO } from '../../../data/checkinOpcoes'
import { nomeDoExame } from '../../../data/examesOpcoes'
import Bloco from '../../../components/Bloco'
import ContextoDoDia from '../../../components/ContextoDoDia'
import GraficoLinha from '../../../components/GraficoLinha'
import Indicador from '../../../components/Indicador'
import Sinal from '../../../components/Sinal'
import TiraDias, { LegendaTira } from '../../../components/TiraDias'

// Origem de cada informação, como pede a especificação: o que o paciente registrou × o que a médica cadastrou.
const Origem = ({ medica }) => (
  <span className="rounded-full bg-papel px-2.5 py-1 text-[11px] font-semibold text-textoSecundario">
    {medica ? 'Cadastrado pela médica' : 'Registrado pelo paciente'}
  </span>
)

// Destaque de cada valor de pressão, olhando a sistólica e a diastólica separadamente.
function marcaPressao(valor, tipo, l) {
  const [max, min, muitoAlta] =
    tipo === 'sistolica' ? [l.sistolicaMax, l.sistolicaMin, PRESSAO_MUITO_ALTA.sistolica] : [l.diastolicaMax, l.diastolicaMin, PRESSAO_MUITO_ALTA.diastolica]
  if (valor >= muitoAlta) return 'muitoAlta'
  if (valor >= max) return 'alta'
  if (valor < min) return 'baixa'
  return undefined
}

const porDia = (checkins, campo) => Object.fromEntries(checkins.filter((c) => c[campo] !== null && c[campo] !== undefined).map((c) => [c.data, c[campo]]))

export default function VisaoGeral({ perfil, dados, dias }) {
  const { config, resumo, pressoes, pesagens, checkins } = dados
  const m = config.modulos
  const desde = diasAtrasISO(dias - 1)
  const hoje = hojeISO()
  const pa = pressoes.filter((p) => p.medidoEm.slice(0, 10) >= desde)
  const ci = checkins.filter((c) => c.data >= desde)
  const l = config.limitesPressao
  const ultima = resumo.ultimaPressao
  const marcasPressao = {
    muitoAlta: { rotulo: `A partir de ${PRESSAO_MUITO_ALTA.sistolica}/${PRESSAO_MUITO_ALTA.diastolica} (estágio 3)`, cor: 'alerta', forma: 'losango' },
    alta: { rotulo: `A partir do limite (${l.sistolicaMax}/${l.diastolicaMax})`, cor: 'atencao', forma: 'triangulo' },
    baixa: { rotulo: `Abaixo do mínimo (${l.sistolicaMin}/${l.diastolicaMin})`, cor: 'atencao', forma: 'trianguloInvertido' },
  }
  const pertoDoMinimo = pa.some((p) => p.diastolica < l.diastolicaMin + 8 || p.sistolica < l.sistolicaMin + 8)
  const sono = ci.filter((c) => c.sonoHoras !== null && c.sonoHoras !== undefined)
  const piorSono = sono.length ? Math.min(...sono.map((c) => c.sonoHoras)) : null
  const ultimaPiorNoite = sono.findLast((c) => c.sonoHoras === piorSono)
  const cigarros = ci.filter((c) => c.cigarros !== null && c.cigarros !== undefined)

  return (
    <div className="space-y-5">
      {/* 1. Indicadores atuais */}
      <Bloco titulo="Indicadores atuais" icone={<Gauge size={15} />} acao={<Origem />}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {m.pressao && (
            <Indicador
              rotulo="Última pressão"
              valor={ultima ? `${ultima.sistolica}/${ultima.diastolica}` : '—'}
              unidade={ultima && 'mmHg'}
              detalhe={ultima ? `${formatarDiaHora(ultima.medidoEm)}${ultima.emRepouso ? ' · em repouso' : ''}` : 'Sem medições'}
              atencao={
                ultima &&
                foraDoPadrao(ultima, l) &&
                (classificarPressao(ultima, l) === 'muitoAlta' ? 'Muito alta (estágio 3 da diretriz) — conferir' : 'Fora do padrão cadastrado — conferir')
              }
            />
          )}
          {m.pressao && (
            <Indicador
              rotulo="Média de pressão"
              valor={resumo.mediaPressao ? `${resumo.mediaPressao.sistolica}/${resumo.mediaPressao.diastolica}` : '—'}
              unidade={resumo.mediaPressao && 'mmHg'}
              detalhe={
                resumo.mediaPressao
                  ? `${resumo.medicoesPressao} medições no período`
                  : config.mostrarMediasPressao
                    ? `Precisa de ${MIN_MEDICOES_PARA_MEDIA}+ medições no período`
                    : 'Desligada — ligar na Configuração ao definir o protocolo'
              }
            />
          )}
          {resumo.imc && (
            <Indicador
              rotulo="IMC calculado"
              valor={formatarImc(resumo.imc.valor)}
              detalhe={resumo.imc.classificacao ?? 'Sem classificação adulta'}
              atencao={resumo.imc.atencao && 'Faixa de obesidade — medida de triagem'}
            />
          )}
          {m.sono && (
            <Indicador
              rotulo="Sono médio"
              valor={resumo.sonoMedio !== null ? formatarNumero(resumo.sonoMedio) : '—'}
              unidade={resumo.sonoMedio !== null && 'h'}
              detalhe="Por noite, declarado"
            />
          )}
          {m.estresse && (
            <Indicador
              rotulo="Estresse médio"
              valor={resumo.estresseMedio !== null ? formatarNumero(resumo.estresseMedio) : '—'}
              unidade={resumo.estresseMedio !== null && '/10'}
              detalhe={`${resumo.diasEstresseAlto} dias acima de ${LIMITE_ESTRESSE}`}
            />
          )}
        </div>
      </Bloco>

      {/* 2. Gráficos de evolução */}
      <Bloco titulo="Evolução" icone={<LineChart size={15} />} acao={<Origem />}>
        <div className="grid gap-8 lg:grid-cols-2">
          {m.pressao && (
            <div className="lg:col-span-2">
              <h3 className="mb-1 font-interface text-sm font-semibold">Pressão arterial (mmHg)</h3>
              <p className="mb-3 text-xs text-textoSecundario">
                Linhas finas: limites cadastrados para conferência. {resumo.pressoesForaDoPadrao.length} de {pa.length} medições fora do padrão
                {resumo.pressoesMuitoAltas.length > 0 && `, ${resumo.pressoesMuitoAltas.length} a partir de ${PRESSAO_MUITO_ALTA.sistolica}/${PRESSAO_MUITO_ALTA.diastolica}`}.
              </p>
              <GraficoLinha
                comHora
                unidade="mmHg"
                desde={desde}
                ate={hoje}
                marcas={marcasPressao}
                referencias={[
                  { valor: l.sistolicaMax, rotulo: `${l.sistolicaMax}` },
                  { valor: l.diastolicaMax, rotulo: `${l.diastolicaMax}` },
                  ...(pertoDoMinimo ? [{ valor: l.diastolicaMin, rotulo: `mín. ${l.diastolicaMin}`, tracejada: true }] : []),
                ]}
                series={[
                  { nome: 'Sistólica', cor: 'carmim', pontos: pa.map((p) => ({ x: p.medidoEm, y: p.sistolica, marca: marcaPressao(p.sistolica, 'sistolica', l) })) },
                  { nome: 'Diastólica', cor: 'ardosia', pontos: pa.map((p) => ({ x: p.medidoEm, y: p.diastolica, marca: marcaPressao(p.diastolica, 'diastolica', l) })) },
                ]}
              />
            </div>
          )}
          {m.peso && pesagens.length > 0 && (
            <div>
              <h3 className="mb-3 font-interface text-sm font-semibold">Peso (kg) · todo o acompanhamento</h3>
              <GraficoLinha
                desde={pesagens[0].medidoEm}
                ate={hoje}
                unidade="kg"
                formatar={(v) => formatarNumero(v)}
                series={[{ nome: 'Peso', cor: 'carmim', pontos: pesagens.map((p) => ({ x: p.medidoEm, y: p.pesoKg })) }]}
              />
            </div>
          )}
          {m.sono && (
            <div>
              <h3 className="mb-3 font-interface text-sm font-semibold">Horas de sono</h3>
              <GraficoLinha
                desde={desde}
                ate={hoje}
                unidade="h"
                formatar={(v) => formatarNumero(v)}
                marcas={{ pior: { rotulo: `Pior noite de sono (${piorSono !== null ? formatarNumero(piorSono) : '—'} h)`, cor: 'atencao', forma: 'anel' } }}
                series={[
                  {
                    nome: 'Sono',
                    cor: 'ardosia',
                    pontos: sono.map((c) => ({
                      x: c.data,
                      y: c.sonoHoras,
                      marca: c.sonoHoras === piorSono ? 'pior' : undefined,
                      anotacao: c === ultimaPiorNoite ? `Pior noite · ${formatarNumero(c.sonoHoras)} h` : undefined,
                    })),
                  },
                ]}
              />
            </div>
          )}
          {m.estresse && (
            <div>
              <h3 className="mb-1 font-interface text-sm font-semibold">Estresse declarado (0 a 10)</h3>
              <p className="mb-3 text-xs text-textoSecundario">
                {resumo.diasEstresseAlto === 1 ? '1 dia' : `${resumo.diasEstresseAlto} dias`} acima de {LIMITE_ESTRESSE} no período.
              </p>
              <GraficoLinha
                desde={desde}
                ate={hoje}
                referencias={[{ valor: LIMITE_ESTRESSE, rotulo: `${LIMITE_ESTRESSE}` }]}
                marcas={{ alto: { rotulo: `Acima de ${LIMITE_ESTRESSE}`, cor: 'atencao', forma: 'triangulo' } }}
                series={[
                  {
                    nome: 'Estresse',
                    cor: 'carmim',
                    pontos: ci.filter((c) => c.estresse !== null).map((c) => ({ x: c.data, y: c.estresse, marca: estresseAlto(c.estresse) ? 'alto' : undefined })),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </Bloco>

      {/* 3. Hábitos */}
      <Bloco titulo="Hábitos" icone={<Activity size={15} />} acao={<Origem />}>
        {m.tabagismo && resumo.cigarrosTotal !== null && (
          <div>
            <h3 className="mb-2 font-interface text-sm font-semibold">Cigarros por dia</h3>
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              <Indicador rotulo="Total no período" valor={resumo.cigarrosTotal} unidade="cigarros" detalhe={`Soma de ${resumo.diasComCigarros} dias respondidos`} />
              <Indicador rotulo="Média diária" valor={formatarNumero(resumo.cigarrosMedia)} unidade="por dia" detalhe="Conforme declarado" />
            </div>
            <GraficoLinha desde={desde} ate={hoje} series={[{ nome: 'Cigarros', cor: 'ardosia', pontos: cigarros.map((c) => ({ x: c.data, y: c.cigarros })) }]} />
          </div>
        )}
        <LegendaTira dias={dias} />
        {m.alcool && <TiraDias rotulo="Consumiu álcool" dias={dias} valores={porDia(ci, 'alcool')} />}
        {m.atividade && (
          <TiraDias rotulo="Atividade física" dias={dias} valores={porDia(ci, 'atividade')} detalhe={`${resumo.atividade.minutos} min no total`} />
        )}
        {m.alimentacao &&
          PERGUNTAS_ALIMENTACAO.filter((p) => config.alimentacaoPerguntas.includes(p.chave)).map((p) => (
            <TiraDias
              key={p.chave}
              rotulo={p.rotulo}
              dias={dias}
              valores={porDia(ci, p.chave)}
            />
          ))}
      </Bloco>

      {/* 4. Sintomas */}
      {m.sintomas && (
        <Bloco titulo="Sintomas relatados" icone={<Stethoscope size={15} />} acao={<Origem />}>
          {resumo.sintomas.length === 0 ? (
            <p className="text-sm text-textoSecundario">Nenhum sintoma relatado no período.</p>
          ) : (
            <ul className="divide-y divide-borda">
              {[...resumo.sintomas].reverse().map((s) => (
                <li key={s.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-interface text-sm font-semibold">{s.sintomas.map(nomeDoSintoma).join(', ')}{s.outro && ` (${s.outro})`}</p>
                    {s.grave && <Sinal tipo="grave">Orientação de emergência exibida ao paciente</Sinal>}
                  </div>
                  <p className="text-xs text-textoSecundario">
                    {formatarDiaHora(s.ocorridoEm)}
                    {s.duracao && ` · durou ${s.duracao}`}
                  </p>
                  {s.contexto && <p className="mt-1 text-sm">O que fazia: “{s.contexto}”</p>}
                  <ContextoDoDia data={s.ocorridoEm.slice(0, 10)} dados={{ checkins, pressoes }} config={config} />
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      )}

      {/* 5. Dados clínicos */}
      <DadosClinicos userId={perfil.id} />
    </div>
  )
}

function DadosClinicos({ userId }) {
  const [clinico, setClinico] = useState(null)

  useEffect(() => {
    Promise.all([listarMedicamentos(userId), listarExames(userId)]).then(([medicamentos, exames]) => setClinico({ medicamentos, exames }))
  }, [userId])

  if (!clinico) return null
  const emUso = clinico.medicamentos.filter((m) => !m.termino || m.termino >= hojeISO())
  // Exame mais recente de cada indicador.
  const ultimos = Object.values(Object.fromEntries(clinico.exames.map((e) => [e.indicador === 'outro' ? e.nomeOutro : e.indicador, e])))

  return (
    <Bloco titulo="Dados clínicos" icone={<ClipboardList size={15} />} acao={<Origem medica />}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-interface text-sm font-semibold">Medicamentos em uso</h3>
          {emUso.length === 0 ? (
            <p className="text-sm text-textoSecundario">Nenhum cadastrado.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {emUso.map((m) => (
                <li key={m.id}>
                  <strong>{m.nome}</strong> {m.dosagem} <span className="text-textoSecundario">· {m.frequencia}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-2 font-interface text-sm font-semibold">Exames mais recentes</h3>
          {ultimos.length === 0 ? (
            <p className="text-sm text-textoSecundario">Nenhum cadastrado.</p>
          ) : (
            <ul className="numeros space-y-1.5 text-sm">
              {ultimos.map((e) => (
                <li key={e.id} className="flex justify-between gap-3">
                  <span>{nomeDoExame(e)}{e.tipo && ` (${e.tipo.toLowerCase()})`}</span>
                  <span>
                    <strong>{String(e.resultado).replace('.', ',')}</strong> {e.unidade} <span className="text-textoSecundario">· {formatarDia(e.data, { month: '2-digit', year: '2-digit' })}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Bloco>
  )
}
