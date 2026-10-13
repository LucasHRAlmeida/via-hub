# Auditoria de citações — lotes 1 a 5

Data da auditoria: 2026-10-13  
Branch: feat/fontes-educacao-saude  
Escopo: 14 fichas promovidas nos lotes 1 a 5  
Método: abertura da fonte original e cotejo literal do campo trechoCitado  
Reconciliação: 2026-10-13 — incorpora três apontamentos da revisão independente (BINÁ)

## Classificações

- CONFIRMADO_LITERAL: trecho registrado corresponde literalmente à fonte.
- CONFIRMADO_LITERAL_COM_TRUNCAMENTO: trecho registrado é fragmento literal legítimo de frase maior.
- PARAFRASE_SEM_CITACAO: ideia corresponde à fonte, mas não há frase literal correspondente.
- COTEJO_INCONCLUSIVO: fonte não pôde ser aberta integralmente; ausência de confirmação não equivale a erro.
- DIVERGENCIA_CLINICA: conteúdo da ficha diverge do que a fonte sustenta.

## Matriz

| # | Ficha | Status | Fonte e versão | Trecho registrado | Cotejo | Correção proposta | Evidência e localização | Pendência |
|---|---|---|---|---|---|---|---|---|
| 1 | dor-peito-emergencia | respondida | SBC, Diretriz de Dor Torácica na UE, 2025, DOI 10.36660/abc.20250620 | "Qualquer pessoa com dor torácica aguda (ou sintoma equivalente) deve procurar atendimento médico imediatamente." | PARAFRASE_SEM_CITACAO | trechoCitado: null; motivo: frase reconstruída, não literal | Figura Central: "SINTOMAS SUSPEITOS (BUSCAR ATENDIMENTO IMEDIATAMENTE)"; texto: "O principal sintoma de um paciente com quadro de SCA é a dor torácica." URL: https://abccardiol.org/wp-content/uploads/articles_xml/0066-782X-abc-122-09-e20250620/0066-782X-abc-122-09-e20250620.x66747.pdf | nenhuma além da correção de citação |
| 2 | hipoglicemia-sinais | respondida | SBD, Metas de controle glicêmico, Ed. 2026, DOI 10.29327/5881296.2026-1 | "Os sintomas podem incluir tremores, irritabilidade, confusão, taquicardia, sudorese e fome." | CONFIRMADO_LITERAL | manter trecho | Seção Introdução, parágrafo sobre hipoglicemia nível 1 (54–69 mg/dL). URL: https://diretriz.diabetes.org.br/metas-de-controle-glicemico/ | nenhuma |
| 3 | prevenir-complicacoes | respondida | SBD, artigo "Manejo do risco cardiovascular: dislipidemia", 21/06/2021; localizador provisório: categoria Complicações | "Pacientes com diabetes tipo 2 têm a incidência de doença cardiovascular e de acidente vascular isquêmico aumentada em duas vezes a quatro vezes, e a mortalidade…" | CONFIRMADO_LITERAL_COM_TRUNCAMENTO | substituir pelo trecho integral; apontar a URL do artigo específico, não da categoria | Fonte: "...e a mortalidade aumentada em 1,5 vez a 3,6 vezes." Localizador provisório: https://diretriz.diabetes.org.br/category/complicacoes/ | confirmar URL direta do artigo antes da reconciliação das fichas |
| 4 | parar-antibiotico | respondida | MS/BVS, Uso de antibióticos: orientações, dica elaborada em dez/2009, fonte CEBRIM | "Nunca pare o tratamento antes do prazo indicado, mesmo que os sintomas tenham melhorado." | CONFIRMADO_LITERAL | manter trecho; corrigir dataPublicacao para 2009-12 | Seção Como evitar a resistência aos antibióticos?, terceiro marcador. URL: https://bvsms.saude.gov.br/uso-correto-de-antibioticos/ | nenhuma |
| 5 | vacinas-adulto | respondida | MS, Calendário Técnico Nacional de Vacinação 2026 — Adulto (25 a 59 anos) | "O Calendário Nacional de Vacinação orienta quais vacinas são necessárias em cada idade." | PARAFRASE_SEM_CITACAO + DIVERGENCIA_CLINICA | trechoCitado: null; corrigir síntese: a vacina indicada na restrição é a pneumocócica 23-valente (VPP23), não a 20-valente; indicação restrita a povos indígenas sem histórico vacinal com pneumocócica conjugada | PDF traz "Vacinação em dia é mais proteção." e condiciona a VPP23. URL: https://www.gov.br/saude/pt-br/vacinacao/arquivos/calendario-nacional-de-vacinacao-adulto | revisão independente da síntese clínica |
| 6 | vacinas-infancia | respondida | MS, Calendário Nacional de Vacinação — Criança, publicado 27/07/2026, atualizado 09/10/2026 | "Vacinar nos primeiros 1.000 dias de vida é um cuidado essencial para a proteção contra intercorrências que possam comprometer o pleno desenvolvimento infantil." | PARAFRASE_SEM_CITACAO | trechoCitado: null; motivo: página 1 do PDF foi aberta; há afirmação semelhante, mas não correspondência literal | PDF oficial, página 1. URL: https://www.gov.br/saude/pt-br/vacinacao/arquivos/calendario-nacional-de-vacinacao-crianca/view | nenhuma além da correção de citação |
| 7 | sinais-alerta-pressao-alta | respondida | SBC, Diretriz Brasileira de Hipertensão Arterial 2025, Arq Bras Cardiol 122(9): e20250624 | "A hipertensão arterial é condição de alto impacto e deve ser avaliada e acompanhada por profissional de saúde." | COTEJO_INCONCLUSIVO | manter status apenas se o texto integral confirmar a frase; caso contrário, trechoCitado: null | A página expõe título, autores e estrutura, mas não o corpo integral. URL: https://abccardiol.org/article/diretriz-brasileira-de-hipertensao-arterial-2025/ | abrir texto integral e cotejar |
| 8 | infeccao-grave-sinais | respondida | MS/BVS, 13/9 — Dia Mundial da Sepse | "Sinais de alerta: temperatura acima de 38°C; diminuição do volume de urina; falta de ar; aumento da frequência cardíaca, conforme a idade de cada paciente; sonolência, confusão mental e/ou agitação; fraqueza extrema; vômito." | CONFIRMADO_LITERAL | manter trecho | Seção Sinais de alerta. URL: https://bvsms.saude.gov.br/13-9-dia-mundial-da-sepse-4/ | nenhuma |
| 9 | usar-bombinha | respondida | CFF, Três recomendações para o bom uso da bombinha, PDF sem data visível; referências internas 2005–2017 | "Agitar vigorosamente, manter-se em pé ou sentado, soltar o ar, inspirar lenta e profundamente enquanto dispara, prender a respiração por 10 segundos e enxaguar a boca após o uso." | PARAFRASE_SEM_CITACAO | trechoCitado: null; motivo: compilação de passos sem frase única literal | Passos separados no PDF: agitar, posição, soltar o ar, inspirar enquanto dispara, prender por 10 segundos, enxaguar a boca. URL: https://www.cff.org.br/userfiles/Tr%C3%AAs%20recomenda%C3%A7%C3%B5es%20para%20o%20uso%20da%20bombinha.pdf | nenhuma além da correção de citação |
| 10 | falta-ar-emergencia | respondida | SBPT, Falta de ar (tradução ATS), página pública | "Contacte seu médico se você repentinamente apresentar falta de ar persistente, dor ou pressão no peito, ou não sentir alívio após o uso da medicação inalatória." | PARAFRASE_SEM_CITACAO | trechoCitado: null; motivo: condensação de marcadores em frase única | Fonte traz marcadores separados: falta de ar persistente repentina; dor ou pressão no peito; sem alívio após inalador; febre ou mudança no catarro; sensação que não acaba após 30 minutos de repouso. URL: https://sbpt.org.br/portal/espaco-saude-respiratoria-falta-de-ar/ | nenhuma além da correção de citação |
| 11 | hiperglicemia-o-que-fazer | respondida | SBD, Manejo do Diabetes Mellitus Tipo 2, Ed. 2026, DOI 10.29327/5881296.2026-2, última revisão 07/08/2026 | "O tratamento do diabetes tipo 2 evoluiu de uma visão focada apenas no controle glicêmico para uma abordagem mais ampla." | PARAFRASE_SEM_CITACAO + suporte insuficiente para a síntese | trechoCitado: null; rebaixar status para parcial até localizar seção que sustente sintomas e conduta leiga | A fonte aberta trata da estratégia de tratamento do DM2; a síntese sobre sintomas e conduta em hiperglicemia não foi localizada no texto recuperado. URL: https://diretriz.diabetes.org.br/manejo-do-diabetes-mellitus-tipo-2/ | revisão independente; localizar seção específica |
| 12 | dpoc-sinais-alerta | respondida | SBPT, Manual DPOC — Diagnóstico e Tratamento, 1ª edição, 2024 | "As exacerbações se caracterizam por aparecimento de novos sintomas ou piora de sintomas habituais (tosse com expectoração, dispneia e chiado) nos últimos 14 dias." | COTEJO_INCONCLUSIVO | trechoCitado: null até abrir a seção IV — Exacerbações (p. 25) | O PDF recuperado confirma título, edição e sumário, mas o trecho não apareceu no conteúdo extraído. URL: https://d1xe7tfg0uwul9.cloudfront.net/sbpt-portal/wp-content/uploads/2024/10/29004701/SBPT_MANUAL_DPOC_FINAL_25_OUT_2024.pdf | abrir seção IV e cotejar |
| 13 | preventivo-colo-utero | respondida | INCA, Detecção precoce, página atualizada 30/09/2025; Portaria Conjunta SAES/SECTICS nº 13/2025 | "O rastreamento deve ser ofertado às mulheres ou qualquer pessoa com colo do útero, na faixa etária de 25 a 64 anos e que já tiveram atividade sexual." | CONFIRMADO_LITERAL | manter trecho | Página do INCA, seção Rastreamento. URL: https://www.gov.br/inca/pt-br/assuntos/gestor-e-profissional-de-saude/controle-do-cancer-do-colo-do-utero/acoes/deteccao-precoce | nenhuma |
| 14 | diabetes-gestacional | respondida | SBD, Rastreamento e diagnóstico da hiperglicemia na gestação, Ed. 2026; última revisão da página 28/01/2022 | "O DMG é definido como uma intolerância aos carboidratos de gravidade variável, que se inicia durante a gestação porém não preenche critérios diagnósticos de DM fora da gestação." | CONFIRMADO_LITERAL | manter trecho | Página da diretriz SBD. URL: https://diretriz.diabetes.org.br/rastreamento-e-diagnostico-da-hiperglicemia-na-gestacao/ | nenhuma |

## Síntese da auditoria (após reconciliação)

- Fichas cotejadas: 14
- CONFIRMADO_LITERAL: 5 (fichas 2, 4, 8, 13, 14)
- CONFIRMADO_LITERAL_COM_TRUNCAMENTO: 1 (ficha 3)
- PARAFRASE_SEM_CITACAO: 6 (fichas 1, 5, 6, 9, 10, 11)
- COTEJO_INCONCLUSIVO: 2 (fichas 7, 12)
- DIVERGENCIA_CLINICA: 1 (ficha 5 — formulação VPP23, não VPP20)

## Registro da reconciliação

1. vacinas-adulto: formulação corrigida de pneumocócica 20-valente para pneumocócica 23-valente (VPP23), conforme apontamento da revisão independente.
2. vacinas-infancia: reclassificada de COTEJO_INCONCLUSIVO para PARAFRASE_SEM_CITACAO, pois a página 1 do PDF foi aberta e a frase não corresponde literalmente.
3. prevenir-complicacoes: referência redirecionada ao artigo específico "Manejo do risco cardiovascular: dislipidemia"; URL direta pendente de confirmação.

## Casos para revisão independente

1. vacinas-adulto — divergência clínica sobre a formulação VPP23 e sua indicação restrita.
2. hiperglicemia-o-que-fazer — síntese não sustentada pelo trecho/fonte aberta; recomendação de rebaixar para parcial.
3. sinais-alerta-pressao-alta — citação não confirmada por texto integral inacessível; manter contenção.

## Regra de retorno

Nenhuma ficha deve ser promovida ou tratada como citation-verified sem cotejo literal. Fonte inacessível preserva a incerteza: não valida nem refuta a afirmação.