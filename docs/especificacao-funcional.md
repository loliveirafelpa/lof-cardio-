# LOF Heart — Documentação funcional do projeto

Versão 1.1 · Revisão do módulo de acompanhamento cardiovascular

*Texto recebido em 19/10/2026. Trechos que eram prévias visuais no documento original foram reescritos como texto.*

A arquitetura do produto tem três componentes:

1. **Cadastro inicial:** dados pessoais e parâmetros de saúde, como peso, altura, idade e cálculo automático do IMC.
2. **Acompanhamento do paciente:** registros periódicos de pressão, sono, tabagismo, álcool, atividade física, estresse, sintomas e alimentação.
3. **Painel da cardiologista:** configuração individual do acompanhamento, histórico dos registros, medicamentos, exames e indicadores de atenção.

A lógica central: **a médica define o que acompanhar; o paciente registra; a LOF organiza e apresenta os dados para avaliação profissional.**

## 1. Cadastro inicial e perfil cardiovascular

| Campo | Tipo | Comportamento |
| --- | --- | --- |
| Nome do paciente | Texto | Identificação |
| Data de nascimento | Data | Cálculo automático da idade |
| Idade | Número calculado | Atualização a partir da data de nascimento |
| Altura | Centímetros | Cadastro e edição |
| Peso | Quilogramas | Cadastro inicial e atualização posterior |
| IMC | Cálculo automático | Visível para paciente e médica |
| Perfil de acompanhamento | Seleção pela médica | Define os módulos habilitados |

### Cálculo automático do IMC

IMC = peso (kg) ÷ [altura (m)]²

| IMC (adultos) | Classificação exibida |
| --- | --- |
| Abaixo de 18,5 | Baixo peso |
| 18,5 a 24,9 | Faixa habitual |
| 25,0 a 29,9 | Sobrepeso |
| 30,0 a 34,9 | Obesidade classe I |
| 35,0 a 39,9 | Obesidade classe II |
| 40,0 ou mais | Obesidade classe III |

**Regra de alerta:** IMC ≥ 30 exibe um indicativo de atenção para obesidade no painel do paciente e da médica, sem apresentar isso como diagnóstico individual.

A classificação adulta não deve ser aplicada automaticamente a menores de 20 anos; gestantes e outros perfis também exigem tratamento específico. O IMC é um indicador de triagem e não mede diretamente a composição corporal.

## 2. Aplicativo do paciente — check-in cardiovascular

O check-in é composto por módulos. A médica ativa ou desativa os campos aplicáveis ao paciente, define a frequência de preenchimento e consulta o histórico.

| Módulo | Campos registrados | Regras funcionais |
| --- | --- | --- |
| Pressão arterial | Sistólica, diastólica, data e horário | Registro numérico; histórico e gráficos |
| Peso | Peso atual em kg | Atualiza o IMC automaticamente a cada nova medição |
| Sono | Horas dormidas e qualidade percebida | Registro simples e histórico |
| Tabagismo | Quantidade de cigarros ou tempo de uso de cigarro eletrônico | Exibido somente quando ativado pela médica |
| Álcool | Consumiu álcool? Sim/Não | Pergunta binária, sem exigir quantidade |
| Atividade física | Fez atividade? Sim/Não; nível de esforço | Se Sim, abre escala de esforço |
| Estresse | Intensidade de 0 a 10 | Controle deslizante |
| Sintomas | Seleção de sintomas | Se algum for selecionado, abre campo contextual |
| Alimentação | Hábitos alimentares do dia | Perguntas rápidas e configuráveis |

### 2.1. Pressão arterial
O paciente informa pressão sistólica (mmHg), diastólica (mmHg), data e horário da medição e, opcionalmente, se estava em repouso e qual aparelho usou. O sistema apresenta as medições em ordem cronológica e em gráfico. **Médias e comparações só devem ser exibidas quando houver dados suficientes e um protocolo de medição adequado, definido pela cardiologista.**

### 2.2. Peso, altura e IMC
Peso e altura são informados no cadastro inicial; o peso pode ser atualizado ao longo do acompanhamento. Toda atualização de peso recalcula o IMC com a altura cadastrada, e o sistema conserva o histórico de pesos e IMCs anteriores.

O indicativo de obesidade aparece como **"IMC na faixa de obesidade — conversar com sua médica"**, evitando mensagens alarmistas ou julgamentos sobre o corpo.

### 2.3. Sono
- *Quantas horas você dormiu na última noite?* — campo numérico.
- *Como avalia a qualidade do seu sono?* — Muito ruim · Ruim · Regular · Boa · Muito boa.

O painel profissional apresenta horas médias, distribuição da qualidade percebida e mudanças ao longo do tempo.

### 2.4. Tabagismo — módulo ativado pela médica
Na configuração, a médica ativa o módulo e escolhe o tipo de consumo acompanhado: cigarro convencional, cigarro eletrônico ou ambos. O paciente responde, por exemplo, *Quantos cigarros fumou hoje?*

O tempo de uso de cigarro eletrônico é tratado como relato de comportamento, não como medida confiável de dose de nicotina.

### 2.5. Consumo de álcool
*Você consumiu bebida alcoólica hoje?* — Sim / Não. O histórico mostra a frequência de dias com consumo declarado, sem estimar quantidade ou risco a partir dessa pergunta isolada.

### 2.6. Atividade física
*Você realizou atividade física hoje?* — Sim / Não. Se Sim: *Qual foi o nível de esforço percebido?* — 1 Leve · 2 Moderado · 3 Intenso. Recomendação: incluir a **duração em minutos** como campo opcional, para a médica avaliar frequência e volume, além da intensidade.

### 2.7. Estresse
*Qual foi seu nível de estresse hoje?* — controle deslizante de 0 ("Nada estressante") a 10 ("Muito estressante"). A médica vê a evolução e pode compará-la visualmente com outros registros. **A LOF não deve afirmar automaticamente que o estresse causou alterações na pressão arterial.**

### 2.8. Sintomas — com contextualização obrigatória
O paciente seleciona um ou mais: palpitações, falta de ar, dor ou desconforto no peito, tontura, cansaço incomum, inchaço nas pernas ou pés, outro.

**Regra condicional:** ao selecionar qualquer sintoma, abre *O que você estava fazendo quando percebeu esse sintoma?* — texto livre, com sugestões opcionais (repousando, caminhando, realizando esforço físico, trabalhando, dormindo). Registrar também horário aproximado e duração do episódio, se o paciente souber.

**Regra de segurança:** sintomas potencialmente graves — dor no peito, falta de ar intensa, desmaio — apresentam **imediatamente** uma orientação clara para procurar atendimento de emergência. O aplicativo não pode induzir o paciente a aguardar a revisão da médica.

### 2.9. Alimentação
Três perguntas iniciais (Sim/Não), que a médica ativa individualmente:
- Consumiu alimentos ultraprocessados hoje?
- Consumiu alimentos que considera muito salgados?
- Consumiu frutas, verduras ou legumes?

O objetivo é registrar hábitos percebidos, não calcular ingestão de sódio ou qualidade nutricional.

## 3. Painel administrativo — LOF Professional

### 3.1. Perfil do paciente
Dados cadastrais, idade, altura, peso atual, IMC e histórico de peso. O indicador de IMC na faixa de obesidade aparece com a classificação e a ressalva de que é medida de triagem.

### 3.2. Configuração do acompanhamento
A médica pode ativar ou desativar módulos individualmente, definir a frequência de preenchimento, escolher quais perguntas aparecem, ajustar os indicadores que deseja visualizar e encerrar ou suspender o acompanhamento. **O sistema registra quem alterou as configurações e quando.**

### 3.3. Medicamentos

| Campo | Descrição |
| --- | --- |
| Medicamento | Nome cadastrado |
| Dosagem | Dose prescrita |
| Frequência | Quantas vezes e em quais horários |
| Data de início | Quando começou o uso |
| Data de término | Quando aplicável |
| Observações | Informações relevantes registradas pela médica |

Decisão de escopo: medicamentos são gerenciados no painel profissional. O check-in não terá, inicialmente, perguntas diárias sobre adesão.

### 3.4. Exames e indicadores clínicos

| Indicador | Registro |
| --- | --- |
| Colesterol total | Resultado, unidade e data |
| LDL-colesterol | Resultado, unidade e data |
| HDL-colesterol | Resultado, unidade e data |
| Triglicerídeos | Resultado, unidade e data |
| Glicemia | Resultado, tipo de exame, unidade e data |
| Hemoglobina glicada | Resultado, unidade e data |
| Outros exames | Campos configuráveis |

Ficam separados dos hábitos cotidianos e podem ser apresentados em gráficos de evolução, com referências laboratoriais. **A LOF não aplica automaticamente uma única meta de LDL ou glicemia a todos os pacientes.**

## 4. Dashboard da cardiologista

Exemplo ("LOF Heart · Visão profissional", paciente demonstrativo, últimos 30 dias, valores ilustrativos): última pressão 128/82 mmHg · IMC 31,2 (faixa de obesidade) · sono médio 6,7 h por noite · estresse médio 5,4/10.

Cinco blocos:
1. **Indicadores atuais:** última pressão, peso, IMC e dados selecionados.
2. **Gráficos de evolução:** pressão, sono, estresse, atividade física e peso.
3. **Hábitos:** tabagismo, álcool e alimentação.
4. **Sintomas:** histórico de episódios e relatos contextuais.
5. **Dados clínicos:** medicamentos e exames cadastrados.

A médica pode filtrar por período e ver a origem de cada informação.

## 5. Regras de alertas e notificações

| Tipo | Exemplo | Comportamento |
| --- | --- | --- |
| Informativo | IMC adulto ≥ 30 | Exibir classificação de referência |
| Registro pendente | Check-in não preenchido | Lembrete opcional ao paciente |
| Dado fora do padrão cadastrado | Medição incomum | Destacar para conferência, sem diagnóstico |
| Sintoma grave declarado | Dor no peito | Orientação imediata de emergência |

Alertas automáticos de risco cardiovascular, decisões sobre medicamentos e notificações clínicas que pressuponham resposta da médica ficam **fora do MVP**, até definição de protocolos, validação e responsabilidades.

## 6. Segurança e privacidade
Dados pessoais sensíveis: autenticação, perfis de acesso, criptografia, registros de auditoria, retenção e exclusão, e regras transparentes de compartilhamento. O paciente deve compreender quais dados ficam disponíveis à médica e em que condições. A base legal precisa ser definida conforme a LGPD, sem presumir que um aceite genérico resolve todas as obrigações. Será necessária avaliação regulatória caso o sistema passe a diagnosticar, fazer predição clínica ou recomendar terapia.

## 7. Escopo consolidado

| Funcionalidade | Prioridade |
| --- | --- |
| Cadastro com idade, altura e peso | MVP |
| Cálculo e classificação de IMC adulto | MVP |
| Registro de pressão arterial | MVP |
| Sono | MVP |
| Tabagismo configurável | MVP |
| Álcool Sim/Não | MVP |
| Atividade física e esforço | MVP |
| Estresse 0–10 | MVP |
| Sintomas com campo contextual | MVP |
| Alimentação simplificada | MVP |
| Painel da médica com histórico | MVP |
| Cadastro de medicamentos | MVP |
| Colesterol, glicemia e outros exames | MVP |
| Resumo pré-consulta automatizado | Fase 2 |
| Integração com medidores e wearables | Fase 2 |
| Alertas clínicos automatizados | Avaliação futura |

## 8. Síntese estratégica
Uma plataforma de acompanhamento de hábitos, sintomas e indicadores cardiovasculares, configurada pela médica e alimentada pelo paciente, reunindo **o que o paciente mede, o que ele faz e o que ele sente** — sem confundir hábitos, sintomas e resultados de exames.

**Validar com a cardiologista:** frequência ideal dos registros, perfis de pacientes elegíveis, protocolos de pressão arterial e quais informações realmente mudariam a avaliação dela na consulta.

**Pergunta de negócio:** quais dados coletados entre consultas geram valor suficiente para que a médica queira usar a LOF continuamente? Essa é a hipótese que o MVP precisa comprovar.
