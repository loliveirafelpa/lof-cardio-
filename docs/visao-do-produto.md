# Visão do produto — LOF Heart

*Documento de negócio, não técnico. Cole no início de uma conversa nova para recuperar o contexto.*

## O que é
Uma plataforma de acompanhamento de hábitos, sintomas e indicadores cardiovasculares, **configurada pela cardiologista e alimentada pelo paciente**. Ela reúne três fontes de informação: **o que o paciente mede** (pressão, peso), **o que ele faz** (sono, tabagismo, álcool, atividade física, alimentação) e **o que ele sente** (estresse, sintomas). A médica define o que acompanhar, o paciente registra e a LOF organiza tudo para a avaliação na consulta.

A especificação funcional completa (versão 1.1) está em `docs/especificacao-funcional.md`.

## Para quem
- **Cardiologista (Admin, "LOF Professional"):** configura o acompanhamento de cada paciente, vê o histórico e cadastra medicamentos e exames. *Nome e CRM ainda a definir.*
- **Pacientes:** adultos em acompanhamento cardiológico. Entram só por cadastro feito pela médica.

## Princípio central
O app **registra e organiza, não diagnostica**. Não afirma causas ("o estresse subiu sua pressão"), não aplica metas únicas de exame a todos e não dispara alertas clínicos automáticos. Se um dia passar a diagnosticar, prever ou recomendar tratamento, precisa de avaliação regulatória antes.

## O que o paciente faz (MVP)
- **Cadastro:** data de nascimento (idade calculada), altura e peso. O IMC é calculado sozinho.
- **Check-in**, só com os módulos que a médica ativou: pressão arterial (sistólica, diastólica, data/hora, repouso e aparelho), peso, sono (horas e qualidade), tabagismo, álcool (sim/não), atividade física (sim/não, esforço e minutos), estresse de 0 a 10, sintomas (com "o que você estava fazendo?", horário e duração) e alimentação (três perguntas de sim/não).
- Vê seu histórico e o IMC atualizado a cada nova pesagem.
- Ao marcar um sintoma grave, vê **na hora** a orientação para procurar emergência.
- **Meus dados:** ver, baixar, corrigir, apagar e revogar o consentimento.

## O que a cardiologista faz (MVP)
- **Perfil do paciente:** dados, idade, altura, peso atual, IMC e histórico de peso.
- **Configuração do acompanhamento:** liga e desliga módulos, define a frequência, escolhe as perguntas, suspende ou encerra. Fica registrado quem alterou e quando.
- **Medicamentos:** nome, dose, frequência, início, término e observações.
- **Exames:** colesterol total, LDL, HDL, triglicerídeos, glicemia, hemoglobina glicada e outros, com unidade, data e referência, em gráficos de evolução.
- **Dashboard:** indicadores atuais, gráficos de evolução, hábitos, sintomas e dados clínicos, com filtro por período e origem de cada informação.

## Fora do MVP
Integração com medidores e wearables ficam para a Fase 2. Alertas clínicos automatizados ficam para avaliação futura.

## Cuidados obrigatórios
- **LGPD:** dado de saúde é dado sensível. O consentimento é específico, separado e guardado com data e hora. O paciente sabe exatamente o que a médica vê.
- **Sigilo médico**, além da LGPD.
- **Não é canal de emergência.**

## Identidade visual
Baseada em três imagens de referência (em `referencias/`, só para inspiração): um pôster vermelho com um coração em traço claro, um coração translúcido vermelho sobre branco e um coração em linhas vermelhas sobre fundo escuro com reflexos azulados.
- **Cores:** carmim do pôster (#A11D25) como marca, rosado (#E7A9AA) para destaques, noite (#16171F) nas faixas de título, ardósia (#4A5FA0) como segunda cor dos gráficos e fundo branco quente (#FAF6F5).
- **Atenção em âmbar, não em vermelho**, para o produto não soar alarmista. A emergência tem caixa própria, com ícone e título.
- **Fontes:** Montserrat (a do pôster) em títulos e rótulos de caixa-alta espaçada, Source Sans 3 no texto.
- Um traço de eletrocardiograma corta as faixas escuras de título. A marca provisória é um coração com pulso num selo carmim.

## Estado atual (19/10/2026)
- **Protótipo navegável completo, com dados fictícios e sem banco de dados**, para validar as funcionalidades antes de conectar o Supabase. Quem testa escolhe entrar como a cardiologista ou como um dos cinco pacientes de exemplo. O que for registrado fica guardado só no navegador de quem testa, e um botão restaura os dados de exemplo.
- **Paciente:** início com o check-in do dia, a próxima consulta e os seus números, check-in completo por módulos (com a orientação de emergência na hora), histórico em gráfico e lista, primeiro acesso com consentimento, e "Meus dados" (baixar, apagar, revogar).
- **Cardiologista:** lista de pacientes com as consultas dos próximos 7 dias no topo e sinais de atenção, cadastro de paciente com perfil de acompanhamento e mensagem pronta para WhatsApp, e a ficha do paciente — que por padrão mostra o período **desde a última consulta** — com as abas visão geral (os 5 blocos, com destaques nos gráficos de pressão, sono e estresse), **Síntese** (antecipada da Fase 2: destaques, cruzamentos entre hábitos e sintomas e o contexto do dia de cada sintoma), consultas (marcar e remover), medicamentos, exames com evolução, perfil e peso, e configuração com histórico de alterações.
- O Supabase não foi criado: o plano gratuito da organização já está no limite de 2 projetos ativos. Há um repositório no GitHub (`loliveirafelpa/lof-cardio-`), mas ainda não há publicação no Vercel.

## Pacientes de exemplo do protótipo
- **Carlos, 48 anos:** IMC 31 e tabagismo ativado, com relato recente de dor no peito.
- **Ana, 64 anos:** pressão acima do limite com frequência, com as médias ligadas.
- **Marcos, 54 anos:** inativo, sem registros há 9 dias.
- **Juliana, 39 anos:** cadastrada ontem, ainda não fez o primeiro acesso.
- **Roberto, 68 anos:** acompanhamento encerrado.

## Integrações estudadas (20/10/2026)
- **Agenda:** no protótipo, a médica cadastra as consultas na ficha. Depois, dá para ler da agenda que ela já usa: Google Agenda (sem custo) ou o software da clínica (depende do fornecedor ter API e de quanto cobra).
- **Lembretes por e-mail:** praticamente sem custo (Resend, gratuito até 3.000 e-mails por mês, mais um domínio próprio, cerca de R$ 40 por ano). Permite uma régua: lembrete após 1 dia sem check-in, aviso de consulta, boas-vindas.
- **Lembretes por WhatsApp:** só pela API oficial da Meta, com número próprio e empresa verificada; cerca de R$ 0,04 a R$ 0,08 por mensagem (≈ R$ 25 a 50 por mês para 50 pacientes). APIs não oficiais descartadas pelo risco de bloqueio.
- Os lembretes nunca levam dado de saúde e dependem de autorização do paciente. Todos exigem o Supabase ligado.
- **Leitura automática de laudos (Exames):** a médica sobe PDF ou foto e os campos vêm preenchidos para ela conferir antes de salvar. Caminho preferido: leitura no próprio navegador, sem custo e sem o laudo sair do computador — PDF digital com extração de texto (pdf.js) e regras por exame; foto com OCR (Tesseract), que erra mais. Alternativa: IA (Claude) via Edge Function, mais robusta, centavos por laudo, exige menção na política de privacidade. Adiado: precisa de 2 ou 3 laudos fictícios ou anonimizados de laboratórios diferentes para testar as regras.

## Para validar com a cardiologista
- Nome, CRM e se o produto leva o nome dela ou só a marca LOF Heart.
- Frequência ideal de cada registro (diário? só a pressão várias vezes por dia?).
- Perfis de pacientes elegíveis (idade mínima, gestantes).
- Protocolo de medição da pressão (quantas medidas, horários, repouso) e quando mostrar médias.
- Limites de pressão padrão (hoje 130/90 e mínimo 90/50) e se medições a partir de 180/110 devem mostrar uma orientação ao paciente.
- Qual sistema de agenda ela usa hoje e quem marca as consultas (ela, secretária ou paciente).
- Se quer lembretes aos pacientes, por qual canal e com que frequência.
- Quais informações realmente mudariam a avaliação dela na consulta.
- Se o paciente pode ver a lista de medicamentos e os exames cadastrados.
- Prazo de guarda dos dados após o fim do acompanhamento.
- Canal de contato para assuntos de privacidade.

## Próximos passos
1. Protótipo publicado no Vercel em 20/10 — enviar o link para a cardiologista testar.
2. Validar com ela as perguntas acima — em especial os limites de pressão e se os cruzamentos da Síntese ajudam na consulta.
3. Decidir o plano do Supabase (gratuito está no limite de 2 projetos; Pro ≈ US$ 45/mês para 3) e conectar o banco.

**Hipótese que o MVP precisa comprovar:** quais dados coletados entre as consultas geram valor suficiente para a médica usar a LOF continuamente?
