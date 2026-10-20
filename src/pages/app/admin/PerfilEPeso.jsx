import { useState } from 'react'
import { Scale, UserRound } from 'lucide-react'
import { atualizarPerfil } from '../../../lib/perfisApi'
import { avaliarImc, formatarImc } from '../../../lib/imc'
import { formatarDia, formatarNumero } from '../../../lib/datas'
import Bloco from '../../../components/Bloco'
import Botao from '../../../components/Botao'
import Campo from '../../../components/Campo'
import Sinal from '../../../components/Sinal'

const dataCurta = (d) => formatarDia(d, { day: '2-digit', month: '2-digit', year: 'numeric' })

// Dados cadastrais e histórico de peso/IMC. Cada pesagem guarda a altura do momento,
// então o IMC antigo não muda se a altura for corrigida depois.
export default function PerfilEPeso({ perfil, dados, aoMudar }) {
  const { resumo, pesagens } = dados
  const [form, setForm] = useState({ nome: perfil.nome, dataNascimento: perfil.dataNascimento ?? '', alturaCm: String(perfil.alturaCm ?? '') })
  const [aviso, setAviso] = useState('')

  async function salvar(e) {
    e.preventDefault()
    await atualizarPerfil(perfil.id, { nome: form.nome.trim(), dataNascimento: form.dataNascimento, alturaCm: Number(form.alturaCm) })
    setAviso('Dados atualizados.')
    aoMudar()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={salvar}>
        <Bloco titulo="Dados cadastrais" icone={<UserRound size={15} />}>
          <Campo rotulo="Nome" id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Nascimento" id="nasc" type="date" value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} ajuda={resumo.idade !== null ? `${resumo.idade} anos` : ''} />
            <Campo rotulo="Altura (cm)" id="altura" inputMode="numeric" value={form.alturaCm} onChange={(e) => setForm({ ...form, alturaCm: e.target.value })} />
          </div>
          <p className="text-sm text-textoSecundario">E-mail de acesso: {perfil.email}</p>
          <div className="flex items-center gap-3">
            <Botao type="submit">Salvar</Botao>
            {aviso && <p className="text-sm text-carmim" role="status">{aviso}</p>}
          </div>
        </Bloco>
      </form>

      <Bloco titulo="Peso e IMC" icone={<Scale size={15} />}>
        {resumo.imc && (
          <div className="space-y-2">
            <p>
              <span className="font-titulo text-3xl font-semibold">{formatarImc(resumo.imc.valor)}</span>{' '}
              <span className="text-sm text-textoSecundario">IMC atual · {resumo.imc.classificacao ?? 'sem classificação adulta (menor de 20 anos)'}</span>
            </p>
            {resumo.imc.atencao && <Sinal tipo="informativo">IMC na faixa de obesidade · medida de triagem, não mede composição corporal</Sinal>}
          </div>
        )}
        <ul className="numeros divide-y divide-borda text-sm">
          {[...pesagens].reverse().map((p) => {
            const imc = avaliarImc(p.pesoKg, p.alturaCm, resumo.idade)
            return (
              <li key={p.id} className="grid grid-cols-3 py-2">
                <span>{dataCurta(p.medidoEm)}</span>
                <span className="text-center font-semibold">{formatarNumero(p.pesoKg)} kg</span>
                <span className="text-right text-textoSecundario">IMC {formatarImc(imc.valor)}</span>
              </li>
            )
          })}
        </ul>
      </Bloco>
    </div>
  )
}
