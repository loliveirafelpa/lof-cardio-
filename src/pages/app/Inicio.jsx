import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CalendarDays, ChevronRight, HeartPulse, Info } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { buscarConfiguracao } from '../../lib/configuracoesApi'
import { listarConsultas, situarConsultas } from '../../lib/consultasApi'
import { buscarCheckin, listarPesagens, listarPressoes, listarSintomas } from '../../lib/registrosApi'
import { avaliarImc, calcularIdade, formatarImc } from '../../lib/imc'
import { diasAtrasISO, diasEntre, formatarDiaHora, formatarNumero, formatarQuando, hojeISO } from '../../lib/datas'
import { nomeDoSintoma } from '../../lib/resumo'
import { FREQUENCIAS } from '../../data/checkinOpcoes'
import Bloco from '../../components/Bloco'
import { BotaoLink } from '../../components/Botao'
import Indicador from '../../components/Indicador'
import Pagina, { Destaque } from '../../components/Pagina'

export default function Inicio() {
  const { perfil } = useAuth()
  const [dados, setDados] = useState(null)

  useEffect(() => {
    Promise.all([
      buscarConfiguracao(perfil.id),
      buscarCheckin(perfil.id, hojeISO()),
      listarPesagens(perfil.id),
      listarPressoes(perfil.id),
      listarSintomas(perfil.id, diasAtrasISO(29)),
      listarConsultas(perfil.id),
    ]).then(([config, checkinHoje, pesagens, pressoes, sintomas, consultas]) =>
      setDados({ config, checkinHoje, pesagens, pressoes, sintomas, proximaConsulta: situarConsultas(consultas).proxima }),
    )
  }, [perfil.id])

  const primeiroNome = perfil.nome.split(' ')[0]

  return (
    <Pagina
      sobretitulo="Início"
      titulo={
        <>
          Olá, <Destaque>{primeiroNome}</Destaque>
        </>
      }
      descricao="Registre aqui sua pressão, seus hábitos e o que sentir. Sua cardiologista acompanha tudo entre as consultas."
    >
      {!dados ? (
        <p className="rounded-3xl bg-branco p-6 text-center text-textoSecundario shadow-cartao">Carregando…</p>
      ) : (
        <Conteudo perfil={perfil} {...dados} />
      )}
    </Pagina>
  )
}

function Conteudo({ perfil, config, checkinHoje, pesagens, pressoes, sintomas, proximaConsulta }) {
  const idade = calcularIdade(perfil.dataNascimento)
  const pesoAtual = pesagens.at(-1)
  const imc = pesoAtual ? avaliarImc(pesoAtual.pesoKg, perfil.alturaCm, idade) : null
  const ultimaPressao = pressoes.at(-1)
  const diasDesdeUltimo = ultimaPressao ? diasEntre(ultimaPressao.medidoEm.slice(0, 10), hojeISO()) : 0
  const frequencia = FREQUENCIAS.find((f) => f.valor === config.frequencia)?.rotulo.toLowerCase()

  return (
    <>
      <Bloco titulo="Check-in de hoje" icone={<CalendarCheck size={15} />}>
        {checkinHoje ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong className="font-interface">Feito!</strong> Obrigado por registrar hoje. Se lembrar de algo, ainda dá para ajustar.
            </p>
            <BotaoLink variante="secundario" to="/app/checkin">
              Ajustar
            </BotaoLink>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-textoSecundario">
              Leva poucos minutos. Sua médica pediu registros <strong className="text-texto">{frequencia}</strong>.
              {diasDesdeUltimo > 1 && <> Seu último registro foi há {diasDesdeUltimo} dias.</>}
            </p>
            <BotaoLink to="/app/checkin" className="w-full py-3">
              Fazer o check-in de hoje
            </BotaoLink>
          </div>
        )}
      </Bloco>

      {proximaConsulta && (
        <Bloco titulo="Sua próxima consulta" icone={<CalendarDays size={15} />}>
          <p className="font-titulo text-xl font-semibold first-letter:uppercase">{formatarQuando(proximaConsulta.inicio)}</p>
          <p className="text-sm text-textoSecundario">
            Continue registrando até lá: sua cardiologista vai ver como foi esse período antes de te atender.
          </p>
        </Bloco>
      )}

      <Bloco titulo="Seus números" icone={<HeartPulse size={15} />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {config.modulos.pressao && (
            <Indicador
              rotulo="Última pressão"
              valor={ultimaPressao ? `${ultimaPressao.sistolica}/${ultimaPressao.diastolica}` : '—'}
              unidade={ultimaPressao && 'mmHg'}
              detalhe={ultimaPressao ? formatarDiaHora(ultimaPressao.medidoEm) : 'Nenhuma medição ainda'}
            />
          )}
          {imc && (
            <Indicador
              rotulo="Seu IMC"
              valor={formatarImc(imc.valor)}
              detalhe={`${imc.classificacao ?? 'Sem classificação para a sua idade'} · peso ${formatarNumero(pesoAtual.pesoKg)} kg`}
              atencao={imc.atencao && 'IMC na faixa de obesidade — conversar com sua médica'}
            />
          )}
        </div>
        {imc && (
          <p className="flex items-start gap-1.5 text-xs text-textoSecundario">
            <Info size={14} className="mt-px shrink-0" aria-hidden />
            O IMC é calculado a partir do seu peso e da sua altura. É uma medida de triagem: não mede diretamente a composição do corpo.
          </p>
        )}
      </Bloco>

      {sintomas.length > 0 && (
        <Bloco titulo="Sintomas relatados nos últimos 30 dias">
          <ul className="divide-y divide-borda">
            {[...sintomas].reverse().slice(0, 3).map((s) => (
              <li key={s.id} className="py-2.5 text-sm">
                <p className="font-semibold">{s.sintomas.map(nomeDoSintoma).join(', ')}</p>
                <p className="text-xs text-textoSecundario">{formatarDiaHora(s.ocorridoEm)}{s.contexto && ` · ${s.contexto}`}</p>
              </li>
            ))}
          </ul>
          <Link to="/app/historico" className="inline-flex items-center gap-1 font-interface text-sm font-semibold text-carmim">
            Ver todo o histórico <ChevronRight size={16} aria-hidden />
          </Link>
        </Bloco>
      )}
    </>
  )
}
