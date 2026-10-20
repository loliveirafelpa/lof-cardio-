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
**Modo protótipo (atual):** não precisa de banco nem de `.env.local`. Em `/entrar`, escolha um perfil (cardiologista ou um dos pacientes de exemplo). Os dados vêm de `src/lib/demo/` e ficam no localStorage do navegador; "Restaurar dados", na faixa do topo, volta ao ponto de partida. Vitrine do design system em `/previa` (só local).

## Organização
- `src/theme.js` — cores, fontes e sombra (únicos valores de cor do projeto; o Tailwind lê daqui). Fontes carregadas no `index.html`.
- `src/lib/` — `AuthContext.jsx` (protótipo: escolha de perfil), `imc.js` (idade, IMC e classificação adulta), `resumo.js` (resumo do período, faixas de pressão, inatividade, sinais de atenção, cruzamentos e frases da Síntese — regras fixas, sem causa nem diagnóstico), `acompanhamento.js` (junta tudo de um paciente para o painel), `datas.js`, e um `xxxApi.js` por assunto: `perfisApi`, `consentimentosApi`, `configuracoesApi` (com histórico de alterações), `registrosApi` (pressão, pesagens, check-ins, sintomas), `clinicoApi` (medicamentos, exames, antecedentes — um registro por paciente, com autor e data da última alteração), `consultasApi` (consultas marcadas e realizadas; `situarConsultas` devolve a última e a próxima), `privacidadeApi`. No protótipo eles usam `lib/demo/`; com o Supabase, viram consultas com RLS. `supabaseClient.js` fica pronto para essa troca.
- `src/data/` — módulos e opções do check-in (`checkinOpcoes.js`, inclui quais sintomas são graves), condições do histórico clínico (`antecedentesOpcoes.js`), indicadores de exame, textos legais e política de privacidade.
- `src/components/` — `Pagina` (faixa escura + traço de pulso + título), `Bloco` (cartão), `Indicador` (número em destaque, com faixa de atenção), `Sinal` (etiqueta com ícone), `GraficoLinha` (gráfico SVG com destaques por forma), `TiraDias` (um quadradinho por dia, com contagem e %), `ContextoDoDia` (o que foi registrado no dia de um sintoma), `Escolhas` (perguntas do check-in), `CamposAntecedentes` (histórico clínico, no cadastro e na ficha), `Abas`, `LayoutAcesso`, `AvisoEmergencia`, `BarraDemonstracao`, `Logo`, `LinhaPulso`, `Botao`/`BotaoLink`, `Campo`.
- `src/pages/` — públicas: `/entrar` (no protótipo, escolha de perfil), `/privacidade`, `/previa` (só local). `src/pages/app/` — paciente. `src/pages/app/admin/` — painel da cardiologista.
- `supabase/migrations/` — histórico do banco. `supabase/functions/` — Edge Functions.

## Regras de negócio já implementadas
- Idade em anos completos a partir da data de nascimento.
- IMC = peso / altura², com uma casa decimal. Classificação adulta (baixo peso, faixa habitual, sobrepeso, obesidade I/II/III) só a partir de 20 anos; IMC ≥ 30 gera indicativo de atenção.
- Sintomas graves (dor no peito, falta de ar intensa, desmaio) abrem a orientação de emergência na hora.
- Pressão: destaque a partir dos limites da médica (padrão 130/90) ou abaixo do mínimo (padrão 90/50) e destaque fixo a partir de 180/110 (estágio 3, Diretriz Brasileira de Hipertensão 2020).
- Estresse destacado quando passa de 7. Paciente inativo = 7 dias ou mais sem nenhum registro (conta do cadastro, se nunca registrou).
- Síntese: cada fator (estresse > 7, sono < 6 h, atividade, álcool, salgados, ultraprocessados) divide os dias em “com” e “sem”; compara dias com sintoma e, se as médias estiverem ligadas, a sistólica média. Grupos com menos de 3 dias não são comparados.
- Período "desde a última consulta": padrão da ficha do paciente quando há consulta realizada; conta do dia da consulta até hoje. Sem consulta, o padrão é 30 dias.
- Período por datas escolhidas (de/até, inclusive): até hoje e no máximo 2 anos. Enquanto a data digitada estiver incompleta ou inválida, o painel segue no último período válido. Médias, gráficos, tiras de hábitos, Síntese e sinais da ficha usam o período; "última pressão", IMC, inatividade e o gráfico de peso (todo o acompanhamento) continuam relativos a hoje. `resumo.noPeriodo(dados, dias, ate)` faz o recorte.
- Ajustes do paciente: check-ins dos últimos 30 dias podem ser editados (`/app/checkin?dia=AAAA-MM-DD`), e pesagens podem ser corrigidas ou apagadas no histórico. Ajuste posterior grava `editadoEm`, mostrado ao paciente como "ajustado/corrigido em".
- Cadastro: a médica marca cada módulo do check-in (pelo menos um). Medicamentos e histórico clínico são opcionais; os medicamentos entram como em uso a partir do dia do cadastro.
- Primeiro acesso: consentimento LGPD (no protótipo; com o Supabase, antes vem a troca da senha provisória) (dois checkboxes, gravados com data/hora e versão do texto).

## Banco de dados
Ainda não criado.

## Deploy
Publicado no Vercel desde 20/10/2026, ligado ao repositório `loliveirafelpa/lof-cardio-` (cada push em `main` publica). No modo protótipo não há variáveis de ambiente. Ao conectar o Supabase, cadastrar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do Vercel.

Se o build local falhar com `Cannot find module ... rollup.win32-x64-msvc.node` (já aconteceu, provavelmente o antivírus apagou o arquivo), apague `node_modules/@rollup/rollup-win32-x64-msvc` e rode `npm install`.

## Telas (protótipo)
**Paciente:** Início (com a próxima consulta) · Check-in (módulos ativados pela médica; sintoma grave mostra emergência na hora) · Histórico (pressão, peso/IMC, check-ins, sintomas; pode apagar medição de pressão, corrigir ou apagar pesagem e editar check-ins anteriores) · Meus dados · Consentimento no primeiro acesso.
**Cardiologista:** Pacientes (consultas dos próximos 7 dias no topo, sinais de atenção, busca, filtros Todos / Com sinais de atenção / Inativos / Encerrados) · Novo paciente (módulos marcados um a um, medicamentos e histórico clínico opcionais, mensagem para WhatsApp) · Paciente, com período "desde a última consulta", 7/30/90 dias ou datas escolhidas, e as abas Visão geral (com o histórico clínico nos dados clínicos), Síntese (destaques, frases por tema, cruzamentos e contexto do dia de cada sintoma; mostra para qual consulta é), Consultas (marcar e remover), Medicamentos, Exames, Perfil e peso (com histórico clínico editável), Configuração (módulos, frequência, limites de pressão, médias, situação e histórico de alterações).

Gráficos em SVG próprio (`GraficoLinha`): carmim + ardósia (#4A5FA0), par validado para daltonismo; legenda com 2+ séries ou destaques; pontos destacados por forma (triângulo, losango, anel) e legenda escrita; leitura ao passar o mouse; "Ver em tabela" em todos.

## O que falta
- Projeto Supabase e schema inicial (perfis, consentimentos, configuração com histórico, pressão, pesagens, check-ins, sintomas, medicamentos, exames e antecedentes), com RLS; trocar o corpo dos `xxxApi.js`.
- Login real (e-mail e senha, senha provisória, "esqueci minha senha") e Edge Function `criar-paciente`.
- Lembretes e régua de contato: e-mail (Resend, gratuito até 3.000/mês) e WhatsApp (API oficial da Meta, ~R$ 0,04 a 0,08 por mensagem de utilidade). Dependem de rotina agendada no Supabase e de autorização do paciente; a mensagem nunca leva dado de saúde.
- Integração da agenda: hoje as consultas são cadastradas à mão; depois, Google Agenda (API gratuita) ou o software da clínica, se tiver API. Só muda o corpo de `consultasApi.js`.
- Rotina de retenção no banco e pedido de encerramento de conta.
- Leitura automática de laudos em Exames (PDF/foto): estudada e adiada; detalhes em `docs/visao-do-produto.md`.
