# LOF Heart

App web de acompanhamento cardiovascular entre consultas. O paciente registra pressão, peso, hábitos e sintomas; a cardiologista (Admin) configura o acompanhamento, vê o histórico e cadastra medicamentos e exames. Visão de negócio em [`docs/visao-do-produto.md`](docs/visao-do-produto.md); especificação funcional em [`docs/especificacao-funcional.md`](docs/especificacao-funcional.md).

## Stack
React 18 + Vite 6 + Tailwind 3 · react-router-dom 6 · Supabase (Postgres, Auth, RLS, Edge Functions) · lucide-react · Vercel.

## Rodar localmente
```bash
npm install
cp .env.example .env.local   # URL e chave pública (publishable) do Supabase
npm run dev -- --port 5181
```
Sem banco configurado, as telas públicas (`/entrar`, `/privacidade`) e a vitrine visual `/previa` já funcionam; o login não.

## Organização
- `src/theme.js` — cores, fontes e sombra (únicos valores de cor do projeto; o Tailwind lê daqui). Fontes carregadas no `index.html`.
- `src/lib/` — `supabaseClient.js`, `AuthContext.jsx`, `imc.js` (idade, IMC e classificação adulta), um `xxxApi.js` por assunto (snake_case ↔ camelCase, `if (error) throw error`).
- `src/data/` — módulos e opções do check-in (`checkinOpcoes.js`, inclui quais sintomas são graves), textos legais e política de privacidade.
- `src/components/` — `Pagina` (faixa escura + traço de pulso + título), `Bloco` (cartão), `Indicador` (número em destaque, com faixa de atenção), `LayoutAcesso`, `AvisoEmergencia`, `Logo`, `LinhaPulso`, `Botao`, `Campo`.
- `src/pages/` — públicas: `/entrar`, `/definir-senha`, `/privacidade`, `/previa` (só local). `src/pages/app/` — paciente. `src/pages/app/admin/` — painel da cardiologista.
- `supabase/migrations/` — histórico do banco. `supabase/functions/` — Edge Functions.

## Regras de negócio já implementadas
- Idade em anos completos a partir da data de nascimento.
- IMC = peso / altura², com uma casa decimal. Classificação adulta (baixo peso, faixa habitual, sobrepeso, obesidade I/II/III) só a partir de 20 anos; IMC ≥ 30 gera indicativo de atenção.
- Sintomas graves (dor no peito, falta de ar intensa, desmaio) abrem a orientação de emergência na hora.
- Primeiro acesso: troca da senha provisória → consentimento LGPD (dois checkboxes, gravados com data/hora e versão do texto).

## Banco de dados
Ainda não criado.

## Deploy
Ainda não publicado. Plano: repositório no GitHub conectado ao Vercel, com variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do Vercel.

## O que falta
- Projeto Supabase e schema inicial (perfis, consentimentos, configuração do acompanhamento com histórico de alterações, pressão, pesagens, check-ins, sintomas, medicamentos e exames), com RLS.
- Edge Function para a cardiologista cadastrar pacientes.
- Check-in do paciente por módulos, histórico e gráficos.
- Painel da cardiologista: perfil, configuração, medicamentos, exames e dashboard.
- Meus dados (exportar, apagar, revogar) e rotina de retenção no banco.
