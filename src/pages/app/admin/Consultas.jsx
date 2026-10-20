import { useState } from 'react'
import { CalendarDays, Info, Trash2 } from 'lucide-react'
import { removerConsulta, salvarConsulta, situarConsultas } from '../../../lib/consultasApi'
import { formatarDia, formatarHora, formatarQuando } from '../../../lib/datas'
import Bloco from '../../../components/Bloco'
import Botao from '../../../components/Botao'
import Campo from '../../../components/Campo'

const dataCompleta = (v) => formatarDia(v, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })

// Agenda simples do paciente: a médica (ou a secretária) marca a data e a hora.
// A Síntese usa a última consulta para montar o período "desde a última consulta".
export default function Consultas({ perfil, consultas, aoMudar }) {
  const [form, setForm] = useState({ inicio: '', observacao: '' })
  const [erro, setErro] = useState('')
  const [confirmar, setConfirmar] = useState(null)
  const { ultima, proxima } = situarConsultas(consultas)

  async function agendar(e) {
    e.preventDefault()
    if (!form.inicio) return setErro('Escolha a data e a hora da consulta.')
    setErro('')
    await salvarConsulta(perfil.id, { inicio: `${form.inicio}:00`, observacao: form.observacao.trim() })
    setForm({ inicio: '', observacao: '' })
    aoMudar()
  }

  async function remover(id) {
    await removerConsulta(id)
    setConfirmar(null)
    aoMudar()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <form onSubmit={agendar}>
        <Bloco titulo="Marcar consulta" icone={<CalendarDays size={15} />}>
          <Campo rotulo="Data e hora" id="inicio" type="datetime-local" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} />
          <Campo
            rotulo="Observação (opcional)"
            id="observacao"
            value={form.observacao}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            ajuda="Ex.: retorno, revisar exames. O paciente vê só a data e a hora."
          />
          {erro && <p className="text-sm text-alerta" role="alert">{erro}</p>}
          <Botao type="submit">Marcar</Botao>
          <p className="flex items-start gap-1.5 text-xs text-textoSecundario">
            <Info size={14} className="mt-px shrink-0" aria-hidden />
            No protótipo, as consultas são cadastradas aqui. Depois, podem vir da agenda que a médica já usa (Google Agenda ou o sistema da clínica).
          </p>
        </Bloco>
      </form>

      <Bloco titulo="Consultas" icone={<CalendarDays size={15} />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-papel p-4">
            <p className="font-interface text-[11px] font-semibold uppercase tracking-wide text-textoSecundario">Próxima</p>
            <p className="mt-1 font-titulo text-lg font-semibold">{proxima ? formatarQuando(proxima.inicio) : 'Nenhuma marcada'}</p>
          </div>
          <div className="rounded-2xl bg-papel p-4">
            <p className="font-interface text-[11px] font-semibold uppercase tracking-wide text-textoSecundario">Última</p>
            <p className="mt-1 font-titulo text-lg font-semibold">{ultima ? formatarDia(ultima.inicio) : 'Nenhuma ainda'}</p>
          </div>
        </div>
        {consultas.length === 0 ? (
          <p className="text-sm text-textoSecundario">Nenhuma consulta cadastrada.</p>
        ) : (
          <ul className="divide-y divide-borda">
            {[...consultas].reverse().map((c) => {
              const futura = new Date(c.inicio) > new Date()
              return (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {dataCompleta(c.inicio)} · {formatarHora(c.inicio)}
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${futura ? 'bg-blush text-carmimEscuro' : 'bg-papel text-textoSecundario'}`}>
                        {futura ? 'Marcada' : 'Realizada'}
                      </span>
                    </p>
                    {c.observacao && <p className="text-xs text-textoSecundario">{c.observacao}</p>}
                  </div>
                  {confirmar === c.id ? (
                    <span className="flex items-center gap-2 text-xs">
                      <button type="button" onClick={() => remover(c.id)} className="font-semibold text-alerta">
                        Remover
                      </button>
                      <button type="button" onClick={() => setConfirmar(null)} className="text-textoSecundario">
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmar(c.id)} className="text-textoSecundario hover:text-alerta" aria-label="Remover consulta">
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Bloco>
    </div>
  )
}
