import { useState } from 'react'
import { FlaskConical, RotateCcw, Users } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { restaurarDemonstracao } from '../lib/demo/banco'

// Faixa fixa no topo do protótipo: deixa claro que os dados são fictícios e permite trocar de perfil
// ou voltar os dados ao ponto de partida. Sai quando o Supabase for conectado.
export default function BarraDemonstracao() {
  const { sessao, sair } = useAuth()
  const [confirmando, setConfirmando] = useState(false)

  function restaurar() {
    restaurarDemonstracao()
    sair()
    window.location.assign('/entrar')
  }

  return (
    <div className="bg-ardosia px-4 py-1.5 font-interface text-[11px] font-semibold text-branco">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="flex items-center gap-1.5">
          <FlaskConical size={13} aria-hidden /> Protótipo · dados fictícios, guardados só neste navegador
        </p>
        <div className="flex items-center gap-4">
          {sessao && (
            <button onClick={sair} className="flex items-center gap-1 underline-offset-2 hover:underline">
              <Users size={13} aria-hidden /> Trocar perfil
            </button>
          )}
          {confirmando ? (
            <span className="flex items-center gap-2">
              Apagar o que foi testado?
              <button onClick={restaurar} className="underline">Sim</button>
              <button onClick={() => setConfirmando(false)} className="underline">Não</button>
            </span>
          ) : (
            <button onClick={() => setConfirmando(true)} className="flex items-center gap-1 underline-offset-2 hover:underline">
              <RotateCcw size={13} aria-hidden /> Restaurar dados
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
