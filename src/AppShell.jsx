import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { House, LogOut, Users } from 'lucide-react'
import { useAuth } from './lib/AuthContext'
import Logo from './components/Logo'
import AvisoEmergencia from './components/AvisoEmergencia'

// Moldura da área logada: exige login e, para pacientes, o consentimento de dados de saúde.
// Cabeçalho escuro que continua na faixa de título de cada tela do paciente; a Admin
// (cardiologista) usa um contêiner largo, pensado para o computador.
export default function AppShell() {
  const { sessao, perfil, ehAdmin, consentiu, carregando, sair } = useAuth()
  const { pathname } = useLocation()

  if (carregando || (sessao && !perfil)) {
    return <p className="p-10 text-center text-textoSecundario">Carregando…</p>
  }
  if (!sessao) return <Navigate to="/entrar" replace />
  // Conta criada pela cardiologista com senha provisória: trocar antes de qualquer coisa.
  if (sessao.user.user_metadata?.trocar_senha) return <Navigate to="/definir-senha" replace />
  if (!ehAdmin && !consentiu && pathname !== '/app/consentimento') {
    return <Navigate to="/app/consentimento" replace />
  }

  const links = ehAdmin
    ? [{ to: '/app/admin', rotulo: 'Pacientes', Icone: Users }]
    : consentiu
      ? [{ to: '/app', rotulo: 'Início', Icone: House, end: true }]
      : []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-noite text-branco">
        <div className={`mx-auto flex items-center justify-between gap-4 px-4 py-3 ${ehAdmin ? 'max-w-6xl' : 'max-w-xl sm:max-w-3xl'}`}>
          <Logo tamanho={34} />

          <nav aria-label="Principal" className="flex items-center gap-5">
            {links.map(({ to, rotulo, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `border-b-2 py-1 font-interface text-sm font-semibold transition-colors ${
                    isActive ? 'border-carmim text-branco' : 'border-transparent text-branco/70 hover:text-branco'
                  }`
                }
              >
                {rotulo}
              </NavLink>
            ))}
          </nav>

          <button onClick={sair} className="flex items-center gap-1.5 font-interface text-xs font-semibold text-branco/70 hover:text-branco">
            <LogOut size={15} aria-hidden /> Sair
          </button>
        </div>
      </header>

      <main className="flex-1">
        {ehAdmin ? (
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {!ehAdmin && (
        <footer className="px-4 pb-6 pt-2">
          <AvisoEmergencia compacto />
          <p className="mt-2 text-center text-xs">
            <Link to="/privacidade" className="text-textoSecundario underline hover:text-carmim">
              Política de privacidade
            </Link>
          </p>
        </footer>
      )}
    </div>
  )
}
