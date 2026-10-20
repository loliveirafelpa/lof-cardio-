import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import AppShell from './AppShell'
import BarraDemonstracao from './components/BarraDemonstracao'
import Login from './pages/Login'
import Privacidade from './pages/Privacidade'
import PreviaVisual from './pages/PreviaVisual'
import Consentimento from './pages/app/Consentimento'
import Inicio from './pages/app/Inicio'
import Checkin from './pages/app/Checkin'
import Historico from './pages/app/Historico'
import MeusDados from './pages/app/MeusDados'
import Pacientes from './pages/app/admin/Pacientes'
import NovoPaciente from './pages/app/admin/NovoPaciente'
import Paciente from './pages/app/admin/Paciente'

// A checagem de verdade é o RLS no banco; isto só organiza a navegação.
function SomenteAdmin({ children }) {
  const { ehAdmin } = useAuth()
  return ehAdmin ? children : <Navigate to="/app" replace />
}

function SomentePaciente({ children }) {
  const { ehAdmin } = useAuth()
  return ehAdmin ? <Navigate to="/app/admin" replace /> : children
}

// Cada tela nova começa do topo (o navegador mantém a rolagem da tela anterior numa SPA).
function VoltarAoTopo() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <VoltarAoTopo />
        <BarraDemonstracao />
        <Routes>
          <Route path="/entrar" element={<Login />} />
          <Route path="/privacidade" element={<Privacidade />} />
          {/* Vitrine do design system, só no ambiente local (não vai para o site publicado). */}
          {import.meta.env.DEV && <Route path="/previa" element={<PreviaVisual />} />}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<SomentePaciente><Inicio /></SomentePaciente>} />
            <Route path="consentimento" element={<SomentePaciente><Consentimento /></SomentePaciente>} />
            <Route path="checkin" element={<SomentePaciente><Checkin /></SomentePaciente>} />
            <Route path="historico" element={<SomentePaciente><Historico /></SomentePaciente>} />
            <Route path="meus-dados" element={<SomentePaciente><MeusDados /></SomentePaciente>} />
            <Route path="admin" element={<SomenteAdmin><Pacientes /></SomenteAdmin>} />
            <Route path="admin/pacientes/novo" element={<SomenteAdmin><NovoPaciente /></SomenteAdmin>} />
            <Route path="admin/pacientes/:id" element={<SomenteAdmin><Paciente /></SomenteAdmin>} />
          </Route>
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
