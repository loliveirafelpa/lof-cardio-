// Direitos do paciente sobre os próprios dados (LGPD): exportar e apagar o que registrou.
// PROTÓTIPO: banco de demonstração do navegador.
// Na versão com Supabase: exportação por consultas com RLS; exclusão por Edge Function, que também
// respeita a guarda mínima do prontuário (medicamentos e exames cadastrados pela médica não somem).
import { ler, gravar, esperar } from './demo/banco'

const TABELAS_DO_PACIENTE = ['pressoes', 'pesagens', 'checkins', 'sintomas']

export async function exportarMeusDados(userId) {
  await esperar()
  const perfil = ler('perfis').find((p) => p.id === userId)
  const dados = { exportadoEm: new Date().toISOString(), perfil }
  for (const t of [...TABELAS_DO_PACIENTE, 'consentimentos']) {
    dados[t] = ler(t).filter((r) => r.userId === userId)
  }
  // Consultas: o paciente recebe data e hora; a observação é anotação da médica.
  dados.consultas = ler('consultas')
    .filter((c) => c.userId === userId)
    .map((c) => ({ inicio: c.inicio }))
  return dados
}

export async function apagarMeusRegistros(userId) {
  await esperar()
  gravar((b) => {
    for (const t of TABELAS_DO_PACIENTE) b[t] = b[t].filter((r) => r.userId !== userId)
  })
}
