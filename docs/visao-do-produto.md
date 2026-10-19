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
Resumo pré-consulta automatizado e integração com medidores e wearables ficam para a Fase 2. Alertas clínicos automatizados ficam para avaliação futura.

## Cuidados obrigatórios
- **LGPD:** dado de saúde é dado sensível. O consentimento é específico, separado e guardado com data e hora. O paciente sabe exatamente o que a médica vê.
- **Sigilo médico**, além da LGPD.
- **Não é canal de emergência.**

## Identidade visual
Baseada em três imagens de referência (em `referencias/`, só para inspiração): um pôster vermelho com um coração em traço claro, um coração translúcido vermelho sobre branco e um coração em linhas vermelhas sobre fundo escuro com reflexos azulados.
- **Cores:** carmim do pôster (#A11D25) como marca, rosado (#E7A9AA) para destaques, noite (#16171F) nas faixas de título, ardósia (#55607F) como segunda cor dos gráficos e fundo branco quente (#FAF6F5).
- **Atenção em âmbar, não em vermelho**, para o produto não soar alarmista. A emergência tem caixa própria, com ícone e título.
- **Fontes:** Montserrat (a do pôster) em títulos e rótulos de caixa-alta espaçada, Source Sans 3 no texto.
- Um traço de eletrocardiograma corta as faixas escuras de título. A marca provisória é um coração com pulso num selo carmim.

## Estado atual (19/10/2026)
- Projeto iniciado: estrutura, design system, tela de entrada, criação de senha, consentimento LGPD, política de privacidade (primeira versão), início do paciente e lista de pacientes da médica (versão mínima). Cálculo de idade e IMC pronto.
- Ainda não tem banco no Supabase, repositório no GitHub nem publicação no Vercel.

## Para validar com a cardiologista
- Nome, CRM e se o produto leva o nome dela ou só a marca LOF Heart.
- Frequência ideal de cada registro (diário? só a pressão várias vezes por dia?).
- Perfis de pacientes elegíveis (idade mínima, gestantes).
- Protocolo de medição da pressão (quantas medidas, horários, repouso) e quando mostrar médias.
- Quais informações realmente mudariam a avaliação dela na consulta.
- Se o paciente pode ver a lista de medicamentos e os exames cadastrados.
- Prazo de guarda dos dados após o fim do acompanhamento.
- Canal de contato para assuntos de privacidade.

**Hipótese que o MVP precisa comprovar:** quais dados coletados entre as consultas geram valor suficiente para a médica usar a LOF continuamente?
