import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { buscarMeuPerfil } from './perfisApi'
import { temConsentimentoSaudeVigente } from './consentimentosApi'

// PROTÓTIPO: não há senha nem Supabase Auth. Quem testa escolhe um perfil na tela de entrada
// e a escolha fica guardada neste navegador. A interface do contexto (sessao, perfil, ehAdmin,
// consentiu, recarregar, sair) é a mesma que a versão com Supabase vai ter.
const CHAVE_SESSAO = 'lof-heart-demo-sessao'
const AuthContext = createContext(null)

function lerSessaoSalva() {
  try {
    const id = localStorage.getItem(CHAVE_SESSAO)
    return id ? { user: { id, user_metadata: {} } } : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessaoSalva)
  const [perfil, setPerfil] = useState(null)
  const [consentiu, setConsentiu] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const carregarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null)
      setConsentiu(false)
      return
    }
    const [p, c] = await Promise.all([buscarMeuPerfil(userId), temConsentimentoSaudeVigente(userId)])
    setPerfil(p)
    setConsentiu(c)
  }, [])

  useEffect(() => {
    carregarPerfil(sessao?.user.id)
      // perfil apagado (ex.: dados restaurados): volta para a escolha de perfil
      .catch(() => setSessao(null))
      .finally(() => setCarregando(false))
  }, [sessao, carregarPerfil])

  function entrarComo(id) {
    try {
      localStorage.setItem(CHAVE_SESSAO, id)
    } catch {
      // sem armazenamento: a escolha vale até recarregar a página
    }
    setCarregando(true)
    setSessao({ user: { id, user_metadata: {} } })
  }

  function sair() {
    try {
      localStorage.removeItem(CHAVE_SESSAO)
    } catch {
      // idem
    }
    setSessao(null)
  }

  const valor = {
    sessao,
    usuario: sessao?.user ?? null,
    perfil,
    ehAdmin: perfil?.role === 'admin',
    consentiu,
    carregando,
    recarregar: () => carregarPerfil(sessao?.user.id),
    entrarComo,
    sair,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
