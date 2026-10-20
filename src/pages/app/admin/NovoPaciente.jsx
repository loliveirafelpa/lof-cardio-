import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Copy } from 'lucide-react'
import { useAuth } from '../../../lib/AuthContext'
import { criarPaciente } from '../../../lib/perfisApi'
import { avaliarImc, calcularIdade, formatarImc } from '../../../lib/imc'
import { CONFIGURACAO_PADRAO } from '../../../lib/demo/semente'
import { PERFIS_ACOMPANHAMENTO } from '../../../data/checkinOpcoes'
import Bloco from '../../../components/Bloco'
import Botao, { BotaoLink } from '../../../components/Botao'
import Campo from '../../../components/Campo'

// Cadastro de paciente pela cardiologista. Gera uma senha provisória e a mensagem pronta para WhatsApp.
// PROTÓTIPO: o paciente criado aparece na tela de entrada para quem testa navegar como ele.
export default function NovoPaciente() {
  const { perfil: medica } = useAuth()
  const [form, setForm] = useState({ nome: '', email: '', dataNascimento: '', alturaCm: '', pesoKg: '' })
  const [perfilAcomp, setPerfilAcomp] = useState('completo')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [criado, setCriado] = useState(null)
  const [copiado, setCopiado] = useState(false)

  const campo = (nome) => ({ id: nome, value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })
  const altura = Number(form.alturaCm)
  const peso = Number(form.pesoKg.replace(',', '.'))
  const idade = form.dataNascimento ? calcularIdade(form.dataNascimento) : null
  const imc = altura && peso ? avaliarImc(peso, altura, idade) : null

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) return setErro('Informe o nome do paciente.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setErro('Informe um e-mail válido.')
    if (!form.dataNascimento) return setErro('Informe a data de nascimento.')
    if (!(altura >= 100 && altura <= 230)) return setErro('Informe a altura em centímetros (ex.: 172).')
    if (form.pesoKg && !(peso >= 25 && peso <= 350)) return setErro('Confira o peso, em quilos.')
    const preset = PERFIS_ACOMPANHAMENTO.find((p) => p.valor === perfilAcomp)
    setEnviando(true)
    try {
      const r = await criarPaciente(
        {
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          dataNascimento: form.dataNascimento,
          alturaCm: altura,
          pesoKg: form.pesoKg ? peso : null,
          configuracao: { ...CONFIGURACAO_PADRAO, modulos: { ...preset.modulos } },
        },
        medica.nome,
      )
      setCriado({ ...r, nome: form.nome.trim(), email: form.email.trim().toLowerCase() })
    } catch (e2) {
      setErro(e2.message || 'Não foi possível cadastrar agora.')
    } finally {
      setEnviando(false)
    }
  }

  if (criado) {
    const mensagem = `Olá, ${criado.nome.split(' ')[0]}! Para acompanharmos sua saúde do coração entre as consultas, criei seu acesso à LOF Heart.\n\nEntre em ${window.location.origin}\nE-mail: ${criado.email}\nSenha provisória: ${criado.senhaProvisoria}\n\nNo primeiro acesso, você vai criar sua própria senha.`
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <h1 className="text-3xl font-semibold">Paciente cadastrado</h1>
        <Bloco titulo="Mensagem para enviar ao paciente">
          <pre className="whitespace-pre-wrap rounded-2xl bg-papel p-4 font-corpo text-sm">{mensagem}</pre>
          <div className="flex flex-wrap gap-3">
            <Botao
              onClick={() => {
                navigator.clipboard?.writeText(mensagem)
                setCopiado(true)
              }}
            >
              {copiado ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copiado ? 'Copiada' : 'Copiar mensagem'}
            </Botao>
            <BotaoLink variante="secundario" to={`/app/admin/pacientes/${criado.id}`}>
              Ver acompanhamento
            </BotaoLink>
          </div>
          <p className="text-xs text-textoSecundario">
            No protótipo, nenhuma mensagem é enviada e a senha não é usada: para ver o app como este paciente, use “Trocar perfil” no topo.
          </p>
        </Bloco>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link to="/app/admin" className="inline-flex items-center gap-1 font-interface text-sm font-semibold text-textoSecundario hover:text-carmim">
        <ArrowLeft size={16} aria-hidden /> Pacientes
      </Link>
      <h1 className="text-3xl font-semibold">Novo paciente</h1>
      <form onSubmit={salvar} className="space-y-5">
        <Bloco titulo="Cadastro inicial">
          <Campo rotulo="Nome completo" autoComplete="off" {...campo('nome')} />
          <Campo rotulo="E-mail" type="email" autoComplete="off" {...campo('email')} ajuda="É por ele que o paciente vai entrar." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo rotulo="Nascimento" type="date" {...campo('dataNascimento')} ajuda={idade !== null ? `${idade} anos` : ' '} />
            <Campo rotulo="Altura (cm)" inputMode="numeric" placeholder="172" {...campo('alturaCm')} />
            <Campo rotulo="Peso (kg)" inputMode="decimal" placeholder="80,5" {...campo('pesoKg')} />
          </div>
          {imc && (
            <p className="rounded-xl bg-papel px-4 py-3 text-sm">
              IMC calculado: <strong>{formatarImc(imc.valor)}</strong>
              {imc.classificacao ? ` · ${imc.classificacao}` : ' · sem classificação adulta (menor de 20 anos)'}
            </p>
          )}
        </Bloco>

        <Bloco titulo="Perfil de acompanhamento">
          <p className="text-sm text-textoSecundario">Um ponto de partida. Depois do cadastro, cada módulo pode ser ligado ou desligado.</p>
          <div className="space-y-2">
            {PERFIS_ACOMPANHAMENTO.map((p) => (
              <label
                key={p.valor}
                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${perfilAcomp === p.valor ? 'border-carmim bg-blush/50' : 'border-borda'}`}
              >
                <input type="radio" name="perfil" className="mt-1 accent-carmim" checked={perfilAcomp === p.valor} onChange={() => setPerfilAcomp(p.valor)} />
                <span>
                  <span className="block font-interface text-sm font-semibold">{p.rotulo}</span>
                  <span className="text-sm text-textoSecundario">{p.descricao}</span>
                </span>
              </label>
            ))}
          </div>
        </Bloco>

        {erro && <p className="text-sm text-alerta" role="alert">{erro}</p>}
        <Botao type="submit" disabled={enviando} className="w-full py-3">
          {enviando ? 'Cadastrando…' : 'Cadastrar paciente'}
        </Botao>
      </form>
    </div>
  )
}
