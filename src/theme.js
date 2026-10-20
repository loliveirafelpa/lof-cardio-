// Identidade visual — extraída das três imagens de referência do projeto:
// o pôster vermelho com o coração em traço claro, o coração translúcido em vermelho
// sobre fundo branco e o coração em linhas vermelhas sobre fundo escuro com reflexos azulados.
// Único lugar com cores e fontes do projeto: nada de hex solto em componentes.

export const cores = {
  carmim: '#A11D25', // vermelho do pôster — marca, botões principais, destaques
  carmimEscuro: '#7C141B', // hover de botões e textos de maior peso sobre claro
  rosado: '#E7A9AA', // círculo rosado do pôster — palavra em destaque sobre fundo escuro, detalhes
  blush: '#F6E4E3', // rosa bem claro — chips selecionados e áreas suaves
  noite: '#16171F', // fundo escuro da terceira imagem — cabeçalho e faixas de título
  noiteSuave: '#252836', // segunda camada escura — cartões sobre a faixa escura
  ardosia: '#4A5FA0', // reflexos azulados da terceira imagem — segunda série dos gráficos (par validado com o carmim para daltonismo)
  grade: '#EFE6E5', // linhas de grade dos gráficos — um passo fora do branco, bem recessivas
  papel: '#FAF6F5', // fundo geral das telas — o branco quente da segunda imagem
  branco: '#FFFFFF',
  texto: '#1E1B22', // texto principal
  textoSecundario: '#6A6370', // legendas, ajuda, rótulos
  borda: '#EADBDA',
  // Atenção (IMC na faixa de obesidade, medição fora do padrão): âmbar, não vermelho —
  // a marca já é vermelha e o produto não deve soar alarmista.
  atencao: '#9A5B13',
  atencaoFundo: '#FBF1E1',
  // Emergência (sintoma grave declarado): sempre com ícone e título, nunca só pela cor.
  alerta: '#B42318',
  alertaFundo: '#FDECEA',
}

export const fontes = {
  titulo: ['Montserrat', 'system-ui', 'sans-serif'], // a geométrica de traço largo do pôster
  corpo: ['"Source Sans 3"', 'system-ui', 'sans-serif'], // leitura confortável
  interface: ['Montserrat', 'system-ui', 'sans-serif'], // botões, menus, rótulos em caixa-alta espaçada, como no pôster
}

// Sombra dos cartões, tingida de vinho (em vez de cinza neutro).
export const sombras = {
  cartao: '0 1px 2px rgba(124, 20, 27, 0.05), 0 12px 32px -18px rgba(124, 20, 27, 0.28)',
}

// As fontes são carregadas do Google Fonts no index.html — se trocar aqui, trocar lá também.
