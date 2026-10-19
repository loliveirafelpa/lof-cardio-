import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SECOES_POLITICA } from '../data/politicaPrivacidade'
import { VERSAO_TERMOS } from '../data/textosLegais'
import { useAuth } from '../lib/AuthContext'
import Logo from '../components/Logo'
import Pagina, { Destaque } from '../components/Pagina'

// Página pública: acessível antes e depois do login.
export default function Privacidade() {
  const { sessao } = useAuth()
  const voltar = sessao ? '/app' : '/entrar'
  const atualizada = VERSAO_TERMOS.split('-').reverse().join('/')

  return (
    <div className="min-h-screen">
      <header className="bg-noite text-branco">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <Logo tamanho={32} />
          <Link to={voltar} className="inline-flex items-center gap-1 font-interface text-xs font-semibold text-branco/70 hover:text-branco">
            <ArrowLeft size={15} aria-hidden /> Voltar
          </Link>
        </div>
      </header>
      <Pagina
        sobretitulo={`Atualizada em ${atualizada}`}
        titulo={
          <>
            Política de <Destaque>privacidade</Destaque>
          </>
        }
        descricao="Como seus dados são guardados, usados e protegidos neste aplicativo."
      >
        <article className="space-y-8 rounded-3xl bg-branco p-6 shadow-cartao sm:p-8">
          {SECOES_POLITICA.map((s) => (
            <section key={s.titulo}>
              <h2 className="text-lg font-semibold text-carmim">{s.titulo}</h2>
              {s.paragrafos?.map((p) => (
                <p key={p} className="mt-2 leading-relaxed">{p}</p>
              ))}
              {s.itens && (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed marker:text-carmim">
                  {s.itens.map((i) => <li key={i}>{i}</li>)}
                </ul>
              )}
            </section>
          ))}
        </article>
      </Pagina>
    </div>
  )
}
