import { useEffect, useState } from 'react'
import { Download, Eye, ShieldCheck, Trash2 } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { buscarConsentimentoSaude, revogarConsentimentoSaude } from '../../lib/consentimentosApi'
import { apagarMeusRegistros, exportarMeusDados } from '../../lib/privacidadeApi'
import { formatarDiaHora } from '../../lib/datas'
import Bloco from '../../components/Bloco'
import Botao from '../../components/Botao'
import Pagina, { Destaque } from '../../components/Pagina'

// Direitos do paciente (LGPD): ver o que a médica vê, baixar, apagar e revogar — de verdade, aqui no app.
export default function MeusDados() {
  const { perfil, recarregar } = useAuth()
  const [consentimento, setConsentimento] = useState(null)
  const [confirmando, setConfirmando] = useState(null)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    buscarConsentimentoSaude(perfil.id).then(setConsentimento)
  }, [perfil.id])

  async function baixar() {
    const dados = await exportarMeusDados(perfil.id)
    const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'meus-dados-lof-heart.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function apagar() {
    await apagarMeusRegistros(perfil.id)
    setConfirmando(null)
    setAviso('Seus registros foram apagados. Medicamentos e exames cadastrados pela sua médica fazem parte do prontuário e seguem guardados por ela.')
  }

  async function revogar() {
    await revogarConsentimentoSaude(perfil.id)
    await recarregar() // sem consentimento, o app leva de volta à tela de autorização
  }

  return (
    <Pagina sobretitulo="Privacidade" titulo={<>Meus <Destaque>dados</Destaque></>} descricao="Você decide sobre as suas informações.">
      <Bloco titulo="O que a sua médica vê" icone={<Eye size={15} />}>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-carmim">
          <li>Tudo o que você registra aqui: pressão, peso, sono, hábitos, estresse, sintomas e alimentação.</li>
          <li>Seu cadastro: nome, idade, altura e o IMC calculado.</li>
          <li>Ninguém além de você e dela tem acesso. O aplicativo não envia nada a terceiros.</li>
        </ul>
      </Bloco>

      <Bloco titulo="Consentimento" icone={<ShieldCheck size={15} />}>
        {consentimento && (
          <p className="text-sm">
            Você autorizou o uso dos seus dados de saúde em <strong>{formatarDiaHora(consentimento.aceitoEm)}</strong>.
          </p>
        )}
        {confirmando === 'revogar' ? (
          <div className="space-y-3 rounded-2xl bg-alertaFundo p-4 text-sm">
            <p>Ao revogar, nenhum registro novo poderá ser feito até você autorizar de novo. O que já foi registrado continua visível para a sua médica, a menos que você apague.</p>
            <div className="flex gap-2">
              <Botao onClick={revogar}>Revogar</Botao>
              <Botao variante="secundario" onClick={() => setConfirmando(null)}>Cancelar</Botao>
            </div>
          </div>
        ) : (
          <Botao variante="secundario" onClick={() => setConfirmando('revogar')}>Revogar consentimento</Botao>
        )}
      </Bloco>

      <Bloco titulo="Seus registros">
        <div className="flex flex-wrap gap-3">
          <Botao variante="secundario" onClick={baixar}><Download size={16} aria-hidden /> Baixar meus dados</Botao>
          {confirmando !== 'apagar' && (
            <Botao variante="discreto" onClick={() => setConfirmando('apagar')}><Trash2 size={16} aria-hidden /> Apagar meus registros</Botao>
          )}
        </div>
        {confirmando === 'apagar' && (
          <div className="space-y-3 rounded-2xl bg-alertaFundo p-4 text-sm">
            <p>Isto apaga todas as suas medições, check-ins e sintomas, sem volta. Sua médica deixa de vê-los.</p>
            <div className="flex gap-2">
              <Botao onClick={apagar}>Apagar tudo</Botao>
              <Botao variante="secundario" onClick={() => setConfirmando(null)}>Cancelar</Botao>
            </div>
          </div>
        )}
        {aviso && <p className="text-sm text-carmim" role="status">{aviso}</p>}
      </Bloco>
    </Pagina>
  )
}
