// "Banco" do protótipo: um objeto guardado no navegador (localStorage) de quem está testando.
// Nada sai do computador. As funções dos arquivos xxxApi.js leem e gravam aqui por enquanto;
// quando o Supabase entrar, só o corpo dessas funções muda — as telas continuam iguais.
import { gerarSemente } from './semente'

const CHAVE = 'lof-heart-demo-v3'
let memoria = null

function carregar() {
  if (memoria) return memoria
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo) memoria = JSON.parse(salvo)
  } catch {
    // navegador sem armazenamento (aba anônima, bloqueio): segue só em memória
  }
  if (!memoria) {
    memoria = gerarSemente()
    persistir()
  }
  // Tabela nova no protótipo (ex.: consultas) entra com os dados de exemplo, sem apagar o que já foi testado.
  const semente = gerarSemente()
  const faltando = Object.keys(semente).filter((t) => !(t in memoria))
  if (faltando.length) {
    for (const t of faltando) memoria[t] = semente[t]
    persistir()
  }
  return memoria
}

function persistir() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(memoria))
  } catch {
    // idem: sem armazenamento, os dados duram até recarregar a página
  }
}

// Leitura: devolve uma cópia, para nenhuma tela alterar o banco sem passar por `gravar`.
export function ler(tabela) {
  return structuredClone(carregar()[tabela])
}

export function gravar(alterar) {
  alterar(carregar())
  persistir()
}

export function restaurarDemonstracao() {
  memoria = gerarSemente()
  persistir()
}

export const novoId = () => crypto.randomUUID()

// Simula a ida e volta da rede, para as telas já nascerem lidando com "carregando".
export const esperar = () => new Promise((r) => setTimeout(r, 120))
