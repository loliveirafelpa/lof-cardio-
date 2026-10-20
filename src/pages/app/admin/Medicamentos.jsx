import { useCallback, useEffect, useState } from 'react'
import { Pencil, Pill, Plus } from 'lucide-react'
import { listarMedicamentos, removerMedicamento, salvarMedicamento } from '../../../lib/clinicoApi'
import { formatarDia, hojeISO } from '../../../lib/datas'
import Bloco from '../../../components/Bloco'
import Botao from '../../../components/Botao'
import Campo from '../../../components/Campo'

const VAZIO = { nome: '', dosagem: '', frequencia: '', inicio: hojeISO(), termino: '', observacoes: '' }
const dataCurta = (d) => formatarDia(d, { day: '2-digit', month: '2-digit', year: 'numeric' })

// Medicamentos — só a cardiologista cadastra (o check-in não pergunta sobre adesão no MVP).
export default function Medicamentos({ perfil }) {
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(() => listarMedicamentos(perfil.id).then(setLista), [perfil.id])
  useEffect(() => {
    carregar()
  }, [carregar])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    if (!editando.nome.trim() || !editando.dosagem.trim()) return setErro('Informe ao menos o nome e a dosagem.')
    if (editando.termino && editando.termino < editando.inicio) return setErro('A data de término não pode ser antes do início.')
    await salvarMedicamento(perfil.id, { ...editando, termino: editando.termino || null })
    setEditando(null)
    carregar()
  }

  async function remover() {
    await removerMedicamento(editando.id)
    setEditando(null)
    carregar()
  }

  if (!lista) return <p className="text-textoSecundario">Carregando…</p>
  const hoje = hojeISO()
  const emUso = lista.filter((m) => !m.termino || m.termino >= hoje)
  const anteriores = lista.filter((m) => m.termino && m.termino < hoje)
  const campo = (nome) => ({ id: nome, value: editando[nome] ?? '', onChange: (e) => setEditando({ ...editando, [nome]: e.target.value }) })

  const Linha = ({ m }) => (
    <li className="flex items-start justify-between gap-3 py-3">
      <div>
        <p className="font-interface font-semibold">
          {m.nome} <span className="font-corpo font-normal">{m.dosagem}</span>
        </p>
        <p className="text-sm text-textoSecundario">
          {m.frequencia} · desde {dataCurta(m.inicio)}
          {m.termino && ` até ${dataCurta(m.termino)}`}
        </p>
        {m.observacoes && <p className="mt-1 text-sm">{m.observacoes}</p>}
      </div>
      <button onClick={() => setEditando(m)} aria-label={`Editar ${m.nome}`} className="rounded-full p-2 text-textoSecundario hover:bg-papel hover:text-carmim">
        <Pencil size={16} />
      </button>
    </li>
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
      <Bloco
        titulo="Em uso"
        icone={<Pill size={15} />}
        acao={!editando && <Botao variante="secundario" onClick={() => setEditando({ ...VAZIO })}><Plus size={16} aria-hidden /> Adicionar</Botao>}
      >
        {emUso.length === 0 ? <p className="text-sm text-textoSecundario">Nenhum medicamento em uso.</p> : <ul className="-my-3 divide-y divide-borda">{emUso.map((m) => <Linha key={m.id} m={m} />)}</ul>}
        {anteriores.length > 0 && (
          <div>
            <h3 className="font-interface text-xs font-semibold uppercase tracking-[0.14em] text-textoSecundario">Anteriores</h3>
            <ul className="divide-y divide-borda opacity-80">{anteriores.map((m) => <Linha key={m.id} m={m} />)}</ul>
          </div>
        )}
      </Bloco>

      {editando && (
        <form onSubmit={salvar}>
          <Bloco titulo={editando.id ? 'Editar medicamento' : 'Novo medicamento'}>
            <Campo rotulo="Medicamento" placeholder="ex.: Losartana" {...campo('nome')} />
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Dosagem" placeholder="50 mg" {...campo('dosagem')} />
              <Campo rotulo="Frequência e horários" placeholder="1x ao dia, manhã" {...campo('frequencia')} />
              <Campo rotulo="Início" type="date" {...campo('inicio')} />
              <Campo rotulo="Término (se houver)" type="date" {...campo('termino')} />
            </div>
            <Campo rotulo="Observações" multilinha {...campo('observacoes')} />
            {erro && <p className="text-sm text-alerta" role="alert">{erro}</p>}
            <div className="flex flex-wrap gap-2">
              <Botao type="submit">Salvar</Botao>
              <Botao type="button" variante="secundario" onClick={() => setEditando(null)}>Cancelar</Botao>
              {editando.id && <Botao type="button" variante="discreto" onClick={remover}>Excluir</Botao>}
            </div>
          </Bloco>
        </form>
      )}
    </div>
  )
}
