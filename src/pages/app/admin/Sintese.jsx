import { CalendarDays, GitCompareArrows, HeartPulse, Info, Moon, Sparkles, Stethoscope, Utensils } from 'lucide-react'
import { cruzarFatores, destaquesDoPeriodo, frasesDosCruzamentos, frasesPorTema, nomeDoSintoma, porcentagem } from '../../../lib/resumo'
import { diasAtrasISO, formatarDiaHora, formatarQuando } from '../../../lib/datas'
import Bloco from '../../../components/Bloco'
import ContextoDoDia from '../../../components/ContextoDoDia'
import Sinal from '../../../components/Sinal'

// Síntese do período para a consulta: destaques, frases por tema, cruzamentos entre hábitos e sintomas
// e o contexto de cada sintoma. Tudo por regras fixas — descreve coincidências nos registros, nunca causa.
const MODULO_DO_FATOR = {
  estresse: (c) => c.modulos.estresse,
  sono: (c) => c.modulos.sono,
  atividade: (c) => c.modulos.atividade,
  alcool: (c) => c.modulos.alcool,
  salgados: (c) => c.modulos.alimentacao && c.alimentacaoPerguntas.includes('salgados'),
  ultraprocessados: (c) => c.modulos.alimentacao && c.alimentacaoPerguntas.includes('ultraprocessados'),
}

const Lista = ({ frases }) => (
  <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed marker:text-carmim">
    {frases.map((f) => <li key={f}>{f}</li>)}
  </ul>
)

export default function Sintese({ dados, dias, descricaoPeriodo, proxima }) {
  const { resumo, config } = dados
  const desde = diasAtrasISO(dias - 1)
  const periodo = {
    checkins: dados.checkins.filter((c) => c.data >= desde),
    pressoes: dados.pressoes.filter((p) => p.medidoEm.slice(0, 10) >= desde),
    sintomas: dados.sintomas.filter((s) => s.ocorridoEm.slice(0, 10) >= desde),
  }
  const destaques = destaquesDoPeriodo(resumo, config)
  const temas = frasesPorTema(resumo)
  const cruzamentos = cruzarFatores(periodo, { mostrarMedias: config.mostrarMediasPressao }).filter((c) => MODULO_DO_FATOR[c.chave](config))
  const frasesCruzamento = frasesDosCruzamentos(cruzamentos)
  const comPressao = cruzamentos.some((c) => c.com.sistolicaMedia !== null)

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl bg-branco p-4 shadow-cartao">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-titulo text-lg font-semibold">Síntese {descricaoPeriodo}</span>
          {proxima && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-carmimEscuro">
              <CalendarDays size={13} aria-hidden /> Para a consulta de {formatarQuando(proxima.inicio)}
            </span>
          )}
        </p>
        <p className="flex items-start gap-2 text-sm text-textoSecundario">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
          Montada por regras fixas a partir do que o paciente registrou nesse período ({dias} dias). Mostra contagens e coincidências entre
          os registros — não indica causa, não diagnostica e não sugere conduta.
        </p>
      </div>

      <Bloco titulo="Destaques do período" icone={<Sparkles size={15} />}>
        {destaques.length === 0 ? (
          <p className="text-sm text-textoSecundario">Nada fora do padrão cadastrado no período.</p>
        ) : (
          <div className="flex flex-col items-start gap-2">
            {destaques.map((d) => <Sinal key={d.texto} tipo={d.tipo}>{d.texto}</Sinal>)}
          </div>
        )}
      </Bloco>

      <div className="grid gap-5 lg:grid-cols-3">
        <Bloco titulo="Pressão" icone={<HeartPulse size={15} />}>
          {temas.pressao.length ? <Lista frases={temas.pressao} /> : <p className="text-sm text-textoSecundario">Sem medições no período.</p>}
        </Bloco>
        <Bloco titulo="Corpo e rotina" icone={<Moon size={15} />}>
          {temas.corpo.length ? <Lista frases={temas.corpo} /> : <p className="text-sm text-textoSecundario">Sem registros no período.</p>}
        </Bloco>
        <Bloco titulo="Hábitos" icone={<Utensils size={15} />}>
          {temas.habitos.length ? <Lista frases={temas.habitos} /> : <p className="text-sm text-textoSecundario">Sem registros no período.</p>}
        </Bloco>
      </div>

      {/* Cruzamentos: cada fator divide os dias com check-in em "com" e "sem". */}
      <Bloco titulo="Cruzamentos" icone={<GitCompareArrows size={15} />}>
        <p className="text-sm text-textoSecundario">
          Em quantos dias houve sintoma quando cada situação estava presente, comparado aos demais dias com check-in.
          {comPressao && ' Com as médias ligadas, também a sistólica média de cada grupo.'} Grupos com menos de 3 dias não são comparados.
        </p>
        {frasesCruzamento.length > 0 && (
          <div className="rounded-2xl bg-atencaoFundo/60 p-4">
            <p className="mb-2 font-interface text-xs font-semibold uppercase tracking-wide text-atencao">Coincidências que se destacam · não indicam causa</p>
            <Lista frases={frasesCruzamento} />
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl border border-borda">
          <table className="numeros w-full min-w-[560px] text-left text-sm">
            <thead className="bg-papel text-xs text-textoSecundario">
              <tr>
                <th className="px-3 py-2 font-semibold">Situação no dia</th>
                <th className="px-3 py-2 font-semibold">Dias com sintoma · quando presente</th>
                <th className="px-3 py-2 font-semibold">Dias com sintoma · demais dias</th>
                {comPressao && <th className="px-3 py-2 font-semibold">Sistólica média (com · sem)</th>}
              </tr>
            </thead>
            <tbody>
              {cruzamentos.map((c) => (
                <tr key={c.chave} className="border-t border-borda">
                  <td className="px-3 py-2 font-semibold">{c.rotulo}</td>
                  {c.comparavel ? (
                    <>
                      <td className="px-3 py-2">
                        {c.com.diasComSintoma}/{c.com.dias} <span className="text-textoSecundario">· {porcentagem(c.com.diasComSintoma, c.com.dias)}%</span>
                      </td>
                      <td className="px-3 py-2">
                        {c.sem.diasComSintoma}/{c.sem.dias} <span className="text-textoSecundario">· {porcentagem(c.sem.diasComSintoma, c.sem.dias)}%</span>
                      </td>
                      {comPressao && (
                        <td className="px-3 py-2">
                          {c.com.sistolicaMedia ?? '—'} · {c.sem.sistolicaMedia ?? '—'} <span className="text-textoSecundario">mmHg</span>
                        </td>
                      )}
                    </>
                  ) : (
                    <td colSpan={comPressao ? 3 : 2} className="px-3 py-2 text-textoSecundario">
                      Poucos dias para comparar ({c.com.dias} com · {c.sem.dias} sem)
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloco>

      {config.modulos.sintomas && (
        <Bloco titulo="Sintomas e o contexto do dia" icone={<Stethoscope size={15} />}>
          {periodo.sintomas.length === 0 ? (
            <p className="text-sm text-textoSecundario">Nenhum sintoma relatado no período.</p>
          ) : (
            <ul className="divide-y divide-borda">
              {[...periodo.sintomas].reverse().map((s) => (
                <li key={s.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-interface text-sm font-semibold">
                      {s.sintomas.map(nomeDoSintoma).join(', ')}
                      {s.outro && ` (${s.outro})`}
                    </p>
                    <span className="text-xs text-textoSecundario">{formatarDiaHora(s.ocorridoEm)}</span>
                    {s.grave && <Sinal tipo="grave">Orientação de emergência exibida</Sinal>}
                  </div>
                  {s.contexto && <p className="mt-1 text-sm">O que fazia: “{s.contexto}”</p>}
                  <ContextoDoDia data={s.ocorridoEm.slice(0, 10)} dados={periodo} config={config} />
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      )}
    </div>
  )
}
