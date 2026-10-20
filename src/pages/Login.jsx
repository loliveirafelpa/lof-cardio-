import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ChevronRight, Stethoscope, UserRound } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { listarPerfisDemonstracao } from '../lib/perfisApi'
import { calcularIdade } from '../lib/imc'
import LayoutAcesso from '../components/LayoutAcesso'
import { Destaque } from '../components/Pagina'

// PROTÓTIPO: em vez de e-mail e senha, quem testa escolhe com qual perfil entrar.
// Na versão com Supabase, volta o formulário de e-mail e senha (ver histórico do git).
const NOTAS = {
  'p-carlos': 'Tabagismo ativado · sintoma grave recente',
  'p-ana': 'Pressão acima do limite com frequência · médias ligadas',
  'p-marcos': 'Inativo · sem registros há 9 dias',
  'p-juliana': 'Cadastrada ontem · ainda não fez o primeiro acesso',
  'p-roberto': 'Acompanhamento encerrado',
}

export default function Login() {
  const { sessao, entrarComo } = useAuth()
  const [perfis, setPerfis] = useState([])

  useEffect(() => {
    listarPerfisDemonstracao().then(setPerfis)
  }, [])

  if (sessao) return <Navigate to="/app" replace />

  const medica = perfis.find((p) => p.role === 'admin')
  const pacientes = perfis.filter((p) => p.role === 'paciente')

  const Opcao = ({ perfil, Icone, titulo, nota }) => (
    <button
      onClick={() => entrarComo(perfil.id)}
      className="flex w-full items-center gap-3 rounded-2xl border border-borda bg-branco p-3.5 text-left transition-colors hover:border-carmim"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush text-carmim">
        <Icone size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-interface text-sm font-semibold">{titulo}</span>
        {nota && <span className="block truncate text-xs text-textoSecundario">{nota}</span>}
      </span>
      <ChevronRight size={18} className="shrink-0 text-textoSecundario" aria-hidden />
    </button>
  )

  return (
    <LayoutAcesso
      titulo={
        <>
          Seu coração,
          <br />
          <Destaque>entre as consultas</Destaque>
        </>
      }
    >
      <div className="space-y-5 rounded-3xl bg-branco p-6 shadow-cartao sm:p-7">
        <div>
          <h2 className="font-titulo text-2xl font-semibold">Entrar no protótipo</h2>
          <p className="mt-1 text-sm text-textoSecundario">Escolha um perfil para navegar. Os dados são fictícios.</p>
        </div>

        {medica && (
          <div>
            <p className="mb-2 font-interface text-[11px] font-semibold uppercase tracking-[0.18em] text-carmim">Visão profissional</p>
            <Opcao perfil={medica} Icone={Stethoscope} titulo="Entrar como cardiologista" nota="Painel, configuração, medicamentos e exames" />
          </div>
        )}

        <div>
          <p className="mb-2 font-interface text-[11px] font-semibold uppercase tracking-[0.18em] text-carmim">Aplicativo do paciente</p>
          <div className="space-y-2">
            {pacientes.map((p) => {
              const idade = calcularIdade(p.dataNascimento)
              return (
                <Opcao
                  key={p.id}
                  perfil={p}
                  Icone={UserRound}
                  titulo={`${p.nome}${idade !== null ? `, ${idade} anos` : ''}`}
                  nota={NOTAS[p.id] ?? 'Cadastrado durante o teste'}
                />
              )
            })}
          </div>
        </div>
      </div>
    </LayoutAcesso>
  )
}
