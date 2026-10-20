# CLAUDE.md — LOF Heart (acompanhamento cardiovascular)

Plataforma de acompanhamento de hábitos, sintomas e indicadores cardiovasculares, **configurada pela cardiologista e alimentada pelo paciente**. Dois perfis: **Admin** (cardiologista — "LOF Professional") e **Paciente**.
Contexto de produto em `docs/visao-do-produto.md`; especificação funcional completa (v1.1) em `docs/especificacao-funcional.md`.

Para qualquer decisão maior, consultar o `playbook-tecnico.md` completo nesta pasta.

## Inegociáveis
- **Stack fixa:** React 18 + Vite + Tailwind, react-router-dom, Supabase (Postgres + Auth + RLS + Edge Functions), lucide-react, Vercel ligado ao GitHub. Sem TypeScript, testes automatizados ou Redux, salvo justificativa explícita.
- **Segurança via RLS:** toda tabela com dado de paciente tem RLS e políticas `_select_own`, `_insert_own`, `_update_own`, `_delete_own` usando `(select auth.uid()) = user_id`. Acesso da Admin via política própria baseada em papel — nunca só escondendo na interface.
- **Um único cliente Supabase** em `src/lib/supabaseClient.js`, só com a anon key. Service role e qualquer segredo só em Edge Function.
- **Migrations:** toda mudança de banco vira arquivo datado em `supabase/migrations/`.
- **LGPD (dado de saúde = dado sensível):** consentimento específico em checkbox separado, gravado no banco com data/hora; política de privacidade simples mencionando também o sigilo médico; prazo de retenção aplicado de verdade no banco; paciente pode ver, exportar, corrigir, apagar e revogar consentimento dentro do app.
- **Design:** cores e fontes só em `src/theme.js`. Nunca hex solto em componente.
- **Deploy:** GitHub → Vercel desde o início; `vercel.json` com rewrite SPA e cabeçalhos de segurança.

## Princípios do produto
- O app **registra e organiza; não diagnostica, não prediz e não recomenda tratamento**. Passar disso exige avaliação regulatória (software como dispositivo médico).
- Linguagem **descritiva, nunca causal**: nunca afirmar que estresse, sono ou hábito "causou" alteração de pressão.
- **IMC:** classificação adulta só a partir de 20 anos (`src/lib/imc.js`). IMC ≥ 30 mostra "IMC na faixa de obesidade — conversar com sua médica", em âmbar, como medida de triagem. Nunca alarmista nem julgando o corpo. Todo peso novo recalcula o IMC e o histórico é preservado.
- **Sintoma grave** (dor no peito, falta de ar intensa, desmaio) mostra **na hora** a orientação de emergência (SAMU 192). O app nunca induz o paciente a esperar a revisão da médica.
- Metas de LDL, glicemia etc. **não** são aplicadas automaticamente: dependem do contexto clínico.
- Médias de pressão só com dados suficientes e protocolo definido pela cardiologista.
- **Destaques e cruzamentos** (pressão fora dos limites da médica ou ≥ 180/110, estresse > 7, pior noite de sono, inativo após 7 dias sem registro, Síntese com hábitos × sintomas): regras fixas em `src/lib/resumo.js`, só para a médica conferir. Cruzamentos sempre como coincidência ("nos dias com…"), com mínimo de dias por grupo — nunca causa.
- Medicamentos, exames e histórico clínico (antecedentes): gerenciados só pela Admin. Toda alteração de configuração do acompanhamento registra quem alterou e quando.

## Modo protótipo (atual)
- **Ainda sem Supabase.** Os dados vêm de `src/lib/demo/` (`semente.js` gera ~45 dias fictícios relativos a hoje; `banco.js` guarda no localStorage do navegador). A tela de entrada é uma escolha de perfil; a `BarraDemonstracao` permite trocar de perfil e restaurar os dados.
- As telas **só** falam com os arquivos `src/lib/xxxApi.js` (funções assíncronas). Para conectar o Supabase: reescrever o corpo dessas funções, trocar o `AuthContext` e o `Login` por e-mail/senha, criar a Edge Function `criar-paciente` e remover `src/lib/demo/` e a `BarraDemonstracao`. As telas não devem precisar mudar.
- Cada `xxxApi.js` tem no topo um comentário com a tabela e a regra de RLS previstas.

## Convenções
- `src/components`, `src/pages`, `src/pages/app`, `src/pages/app/admin`, `src/lib` (um arquivo `xxxApi.js` por assunto, snake_case ↔ camelCase, `if (error) throw error`), `src/data`, `src/theme.js`.
- Telas do paciente usam `Pagina` (faixa `noite` + traço de pulso + título com `Destaque` em itálico rosado) e `Bloco` (cartão). Telas de acesso usam `LayoutAcesso`. Números em destaque usam `Indicador`.
- Vermelho (`carmim`) é a marca; **atenção** é âmbar (`atencao`) e **emergência** é `alerta` sempre com ícone e título — nunca só pela cor.
- Vitrine do design system em `/previa` (só no ambiente local).
- Ambiente local: `npm run dev -- --port 5181`. Senhas de teste nunca vão para o repositório.
- Imagens em `referencias/` são só inspiração (material de terceiros): não versionar nem usar no app.
- Commits em português, verbo no imperativo, descrevendo o efeito para quem usa. Sem `feat:`/`fix:`.
- Manter `README.md` técnico e `docs/visao-do-produto.md` (negócio) atualizados.
