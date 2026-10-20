import { useCallback, useEffect, useState } from 'react'
import { FlaskConical, Plus, Trash2 } from 'lucide-react'
import { listarExames, removerExame, salvarExame } from '../../../lib/clinicoApi'
import { formatarDia, formatarNumero, hojeISO } from '../../../lib/datas'
import { INDICADORES_EXAME, nomeDoExame, TIPOS_GLICEMIA } from '../../../data/examesOpcoes'
import Bloco from '../../../components/Bloco'
import Botao from '../../../components/Botao'
import Campo from '../../../components/Campo'
import GraficoLinha from '../../../components/GraficoLinha'
import { EscolhaUnica } from '../../../components/Escolhas'

const VAZIO = { indicador: 'ldl', nomeOutro: '', tipo: '', resultado: '', unidade: 'mg/dL', referencia: '', data: hojeISO() }
const dataCurta = (d) => formatarDia(d, { day: '2-digit', month: '2-digit', year: 'numeric' })
const valor = (v) => (Number.isInteger(v) ? String(v) : formatarNumero(v))

// Exames e indicadores clínicos, separados dos hábitos. Um cartão por indicador, com evolução
// quando há dois resultados ou mais. Sem metas automáticas: a referência é escrita pela médica.
export default function Exames({ perfil }) {
  const [lista, setLista] = useState(null)
  const [novo, setNovo] = useState(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(() => listarExames(perfil.id).then(setLista), [perfil.id])
  useEffect(() => {
    carregar()
  }, [carregar])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    const resultado = Number(String(novo.resultado).replace(',', '.'))
    if (!novo.resultado || Number.isNaN(resultado)) return setErro('Informe o resultado em número.')
    if (novo.indicador === 'outro' && !novo.nomeOutro.trim()) return setErro('Informe o nome do exame.')
    await salvarExame(perfil.id, { ...novo, resultado })
    setNovo(null)
    carregar()
  }

  if (!lista) return <p className="text-textoSecundario">Carregando…</p>

  const grupos = {}
  for (const e of lista) {
    const chave = e.indicador === 'outro' ? `outro:${e.nomeOutro}` : e.indicador
    ;(grupos[chave] ??= []).push(e)
  }
  const indicadorNovo = INDICADORES_EXAME.find((i) => i.valor === novo?.indicador)

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        {!novo && <Botao onClick={() => setNovo({ ...VAZIO })}><Plus size={16} aria-hidden /> Registrar resultado</Botao>}
      </div>

      {novo && (
        <form onSubmit={salvar}>
          <Bloco titulo="Novo resultado de exame" icone={<FlaskConical size={15} />}>
            <EscolhaUnica
              opcoes={INDICADORES_EXAME}
              valor={novo.indicador}
              aoMudar={(v) => v && setNovo({ ...novo, indicador: v, unidade: INDICADORES_EXAME.find((i) => i.valor === v).unidade, tipo: '' })}
            />
            {novo.indicador === 'outro' && <Campo rotulo="Nome do exame" id="nomeOutro" value={novo.nomeOutro} onChange={(e) => setNovo({ ...novo, nomeOutro: e.target.value })} />}
            {indicadorNovo?.comTipo && (
              <EscolhaUnica opcoes={TIPOS_GLICEMIA.map((t) => ({ valor: t, rotulo: t }))} valor={novo.tipo} aoMudar={(v) => setNovo({ ...novo, tipo: v ?? '' })} />
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Campo rotulo="Resultado" id="resultado" inputMode="decimal" value={novo.resultado} onChange={(e) => setNovo({ ...novo, resultado: e.target.value })} />
              <Campo rotulo="Unidade" id="unidade" value={novo.unidade} onChange={(e) => setNovo({ ...novo, unidade: e.target.value })} />
              <Campo rotulo="Data do exame" id="data" type="date" value={novo.data} onChange={(e) => setNovo({ ...novo, data: e.target.value })} />
              <Campo rotulo="Referência do laudo" id="referencia" placeholder="opcional" value={novo.referencia} onChange={(e) => setNovo({ ...novo, referencia: e.target.value })} />
            </div>
            {erro && <p className="text-sm text-alerta" role="alert">{erro}</p>}
            <div className="flex gap-2">
              <Botao type="submit">Salvar</Botao>
              <Botao type="button" variante="secundario" onClick={() => setNovo(null)}>Cancelar</Botao>
            </div>
          </Bloco>
        </form>
      )}

      {lista.length === 0 && <p className="rounded-3xl bg-branco p-6 text-textoSecundario shadow-cartao">Nenhum exame cadastrado.</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {Object.entries(grupos).map(([chave, resultados]) => {
          const ultimo = resultados.at(-1)
          return (
            <Bloco key={chave} titulo={nomeDoExame(ultimo)}>
              <p>
                <span className="font-titulo text-3xl font-semibold">{valor(ultimo.resultado)}</span>{' '}
                <span className="text-sm text-textoSecundario">{ultimo.unidade} · {dataCurta(ultimo.data)}{ultimo.tipo && ` · ${ultimo.tipo.toLowerCase()}`}</span>
              </p>
              {resultados.length > 1 && (
                <GraficoLinha
                  desde={resultados[0].data}
                  ate={ultimo.data}
                  unidade={ultimo.unidade}
                  formatar={valor}
                  rotuloTabela="Data do exame"
                  series={[{ nome: nomeDoExame(ultimo), cor: 'carmim', pontos: resultados.map((r) => ({ x: r.data, y: r.resultado })) }]}
                />
              )}
              <ul className="divide-y divide-borda text-sm">
                {[...resultados].reverse().map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                    <span>{dataCurta(r.data)}</span>
                    <span className="numeros">
                      {valor(r.resultado)} {r.unidade}
                      {r.referencia && <span className="text-textoSecundario"> · ref. {r.referencia}</span>}
                    </span>
                    <button
                      onClick={() => removerExame(r.id).then(carregar)}
                      aria-label="Excluir este resultado"
                      className="rounded-full p-1.5 text-textoSecundario hover:bg-papel hover:text-alerta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </Bloco>
          )
        })}
      </div>
    </div>
  )
}
