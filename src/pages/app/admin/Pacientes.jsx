import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { listarPacientes } from '../../../lib/perfisApi'
import { calcularIdade } from '../../../lib/imc'
import Bloco from '../../../components/Bloco'

// Lista de pacientes da cardiologista. Primeira versão: só nome e idade.
export default function Pacientes() {
  const [pacientes, setPacientes] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    listarPacientes()
      .then(setPacientes)
      .catch(() => setErro('Não foi possível carregar os pacientes.'))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="font-interface text-[11px] font-semibold uppercase tracking-[0.2em] text-carmim">LOF Heart · Visão profissional</p>
        <h1 className="mt-2 text-3xl font-semibold">Pacientes</h1>
      </div>
      <Bloco titulo="Em acompanhamento" icone={<Users size={15} />}>
        {erro && <p className="text-sm text-alerta" role="alert">{erro}</p>}
        {!pacientes && !erro && <p className="text-textoSecundario">Carregando…</p>}
        {pacientes?.length === 0 && <p className="text-textoSecundario">Nenhum paciente cadastrado ainda.</p>}
        {pacientes?.length > 0 && (
          <ul className="divide-y divide-borda">
            {pacientes.map((p) => {
              const idade = calcularIdade(p.dataNascimento)
              return (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <span className="font-semibold">{p.nome || 'Sem nome'}</span>
                  <span className="text-sm text-textoSecundario">{idade !== null ? `${idade} anos` : '—'}</span>
                </li>
              )
            })}
          </ul>
        )}
      </Bloco>
    </div>
  )
}
