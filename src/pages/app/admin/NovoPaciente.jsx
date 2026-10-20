import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Plus, X } from 'lucide-react'
import { useAuth } from '../../../lib/AuthContext'
import { criarPaciente } from '../../../lib/perfisApi'
import { salvarAntecedentes, salvarMedicamento } from '../../../lib/clinicoApi'
import { avaliarImc, calcularIdade, formatarImc } from '../../../lib/imc'
import { hojeISO } from '../../../lib/datas'
import { CONFIGURACAO_PADRAO } from '../../../lib/demo/semente'
import { MODULOS } from '../../../data/checkinOpcoes'
import { ANTECEDENTES_VAZIO } from '../../../data/antecedentesOpcoes'
import Bloco from '../../../components/Bloco'
import Botao, { BotaoLink } from '../../../components/Botao'
import Campo from '../../../components/Campo'
import CamposAntecedentes from '../../../components/CamposAntecedentes'

const REMEDIO_VAZIO = { nome: '', dosagem: '', frequencia: '' }

function OpcaoModulo({ rotulo, marcado, aoMudar, children }) {
  return (
    <div className={`rounded-2xl border ${marcado ? 'border-carmim bg-blush/50' : 'border-borda'}`}>
      <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
        <input type="checkbox" className="h-4 w-4 accent-carmim" checked={marcado} onChange={(e) => aoMudar(e.target.checked)} />
        <span className="font-interface text-sm font-semibold">{rotulo}</span>
      </label>
      {marcado && children && <div className="rounded-b-2xl border-t border-borda bg-branco px-4 py-4">{children}</div>}
    </div>
  )
}

// Cadastro de paciente pela cardiologista. Gera uma senha provisória e a mensagem pronta para WhatsApp.
// PROTÓTIPO: o paciente criado aparece na tela de entrada para quem testa navegar como ele.
export default function NovoPaciente() {
  const { perfil: medica } = useAuth()
  const [form, setForm] = useState({ nome: '', email: '', dataNascimento: '', alturaCm: '', pesoKg: '' })
  // Começa tudo desmarcado: a médica escolhe cada módulo que quer acompanhar.
  const [modulos, setModulos] = useState(() => Object.fromEntries(MODULOS.map((m) => [m.chave, false])))
  const todosMarcados = MODULOS.every((m) => modulos[m.chave])
  // Medicamentos e histórico: preenchidos aqui pela médica, não entram no check-in do paciente.
  const [comRemedios, setComRemedios] = useState(false)
  const [remedios, setRemedios] = useState([{ ...REMEDIO_VAZIO }])
  const [comHistorico, setComHistorico] = useState(false)
  const [antecedentes, setAntecedentes] = useState(ANTECEDENTES_VAZIO)
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
    if (!MODULOS.some((m) => modulos[m.chave])) return setErro('Marque pelo menos um módulo para acompanhar.')
    // Linhas totalmente vazias são ignoradas; as preenchidas precisam de nome e dosagem.
    const remediosPreenchidos = comRemedios ? remedios.filter((m) => m.nome.trim() || m.dosagem.trim() || m.frequencia.trim()) : []
    if (remediosPreenchidos.some((m) => !m.nome.trim() || !m.dosagem.trim())) return setErro('Informe o nome e a dosagem de cada medicamento.')
    setEnviando(true)
    try {
      const r = await criarPaciente(
        {
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          dataNascimento: form.dataNascimento,
          alturaCm: altura,
          pesoKg: form.pesoKg ? peso : null,
          configuracao: { ...CONFIGURACAO_PADRAO, modulos: { ...modulos } },
        },
        medica.nome,
      )
      for (const m of remediosPreenchidos) {
        await salvarMedicamento(r.id, {
          nome: m.nome.trim(),
          dosagem: m.dosagem.trim(),
          frequencia: m.frequencia.trim(),
          inicio: hojeISO(),
          termino: null,
          observacoes: '',
        })
      }
      if (comHistorico) await salvarAntecedentes(r.id, antecedentes, medica.nome)
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

        <Bloco titulo="O que acompanhar">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-textoSecundario">Marque os módulos que o paciente vai registrar. Depois do cadastro, dá para mudar na Configuração.</p>
            <button
              type="button"
              onClick={() => setModulos(Object.fromEntries(MODULOS.map((m) => [m.chave, !todosMarcados])))}
              className="font-interface text-xs font-semibold text-carmim underline"
            >
              {todosMarcados ? 'Desmarcar todos' : 'Marcar todos'}
            </button>
          </div>
          <div className="space-y-2">
            {MODULOS.map((m) => (
              <OpcaoModulo key={m.chave} rotulo={m.rotulo} marcado={modulos[m.chave]} aoMudar={(v) => setModulos({ ...modulos, [m.chave]: v })} />
            ))}
          </div>

          <p className="pt-2 text-sm text-textoSecundario">Preenchidos por você agora, na ficha do paciente (opcionais):</p>
          <div className="space-y-2">
            <OpcaoModulo rotulo="Medicamentos" marcado={comRemedios} aoMudar={setComRemedios}>
              <div className="space-y-3">
                {remedios.map((m, i) => {
                  const mudar = (campo) => (e) => setRemedios(remedios.map((x, j) => (j === i ? { ...x, [campo]: e.target.value } : x)))
                  return (
                    <div key={i} className="grid grid-cols-[1fr,auto] items-end gap-2">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Campo rotulo="Medicamento" id={`rem-nome-${i}`} placeholder="ex.: Losartana" value={m.nome} onChange={mudar('nome')} />
                        <Campo rotulo="Dosagem" id={`rem-dose-${i}`} placeholder="50 mg" value={m.dosagem} onChange={mudar('dosagem')} />
                        <Campo rotulo="Frequência" id={`rem-freq-${i}`} placeholder="1x ao dia, manhã" value={m.frequencia} onChange={mudar('frequencia')} />
                      </div>
                      {remedios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setRemedios(remedios.filter((_, j) => j !== i))}
                          aria-label={`Remover ${m.nome || 'este medicamento'}`}
                          className="mb-2 rounded-full p-2 text-textoSecundario hover:bg-papel hover:text-alerta"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  )
                })}
                <Botao type="button" variante="secundario" onClick={() => setRemedios([...remedios, { ...REMEDIO_VAZIO }])}>
                  <Plus size={16} aria-hidden /> Adicionar medicamento
                </Botao>
                <p className="text-xs text-textoSecundario">Entram como em uso a partir de hoje. Datas e observações podem ser ajustadas na aba Medicamentos.</p>
              </div>
            </OpcaoModulo>
            <OpcaoModulo rotulo="Histórico do paciente" marcado={comHistorico} aoMudar={setComHistorico}>
              <CamposAntecedentes valor={antecedentes} aoMudar={setAntecedentes} />
            </OpcaoModulo>
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
