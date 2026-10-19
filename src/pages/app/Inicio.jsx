import { HeartPulse } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { calcularIdade } from '../../lib/imc'
import Bloco from '../../components/Bloco'
import Pagina, { Destaque } from '../../components/Pagina'

// Início do paciente. Por enquanto só a saudação; o check-in e o resumo de peso/IMC
// entram quando as tabelas de registros estiverem no banco.
export default function Inicio() {
  const { perfil } = useAuth()
  const primeiroNome = perfil.nome.split(' ')[0]
  const idade = calcularIdade(perfil.dataNascimento)

  return (
    <Pagina
      sobretitulo="Início"
      titulo={
        <>
          Olá{primeiroNome && ','} <Destaque>{primeiroNome || 'boas-vindas'}</Destaque>
        </>
      }
      descricao="Registre aqui sua pressão, seus hábitos e o que sentir. Leva poucos minutos."
    >
      <Bloco titulo="Seu perfil" icone={<HeartPulse size={15} />}>
        <p className="text-sm text-textoSecundario">
          {idade !== null ? `${idade} anos` : 'Data de nascimento não informada'}
          {perfil.alturaCm ? ` · ${perfil.alturaCm} cm` : ''}
        </p>
      </Bloco>
    </Pagina>
  )
}
