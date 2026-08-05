# Registro de fontes e alegações

## Regra editorial

Nenhuma afirmação normativa, técnica ou clínica entra na apostila apenas porque parece plausível. Cada proposição deve ter:

- fonte identificada;
- natureza da fonte;
- data de verificação;
- trecho ou artigo de apoio;
- implicação redigida separadamente da citação;
- nível de certeza;
- revisor responsável.

## Fonte primária inicial

### CFM-2454-2026

- **Título:** Resolução CFM nº 2.454, de 11 de fevereiro de 2026
- **Objeto:** normatiza o uso da inteligência artificial na medicina
- **Publicação:** Diário Oficial da União, 27/02/2026
- **Retificação:** Diário Oficial da União, 05/03/2026
- **Emissor:** Conselho Federal de Medicina
- **Tipo:** norma profissional primária
- **URL oficial:** https://sistemas.cfm.org.br/normas/visualizar/resolucoes/br/2026/2454
- **Última verificação:** 2026-08-05

## Matriz inicial de proposições

> Esta tabela é um mapa de trabalho. A redação final deverá citar o artigo e conferir a retificação antes de publicação.

| ID | Proposição normativa | Base inicial | Tradução operacional provisória | Certeza |
|---|---|---|---|---|
| P01 | A norma abrange pesquisa, desenvolvimento, governança, auditoria, monitoramento, capacitação e uso responsável de IA na medicina. | Art. 1º | O curso não pode reduzir governança a mero modo de perguntar ao modelo. | Alta |
| P02 | O médico pode utilizar IA como apoio, preservados limites éticos e legais. | Direitos do médico | O uso não é proibido nem excepcional por definição; precisa ser qualificado pelo contexto e pelo risco. | Alta |
| P03 | O médico pode recusar sistemas sem validação científica adequada, certificação pertinente ou compatibilidade ética, técnica e legal. | Art. 3º | A recusa crítica é parte da autonomia profissional. | Alta |
| P04 | O médico permanece responsável pelas decisões clínicas, diagnósticas, terapêuticas e prognósticas. | Art. 4º e Art. 7º | A saída da IA é insumo, não transferência de autoria decisória. | Alta |
| P05 | É vedada a delegação à IA da comunicação de diagnóstico, prognóstico ou decisão terapêutica sem mediação humana. | Art. 5º, §2º | Interfaces voltadas ao paciente não devem operar como comunicadores autônomos de decisão médica. | Alta |
| P06 | O paciente deve ter sua autonomia respeitada, inclusive quanto à recusa informada do uso de IA. | Art. 5º, §3º | O curso precisa tratar informação e recusa sem criar burocracia indiscriminada. | Alta |
| P07 | O médico deve zelar pela confidencialidade, integridade e segurança dos dados de saúde. | Art. 6º | Não inserir dados identificáveis em ferramentas sem governança e base adequada. | Alta |
| P08 | Falhas, riscos relevantes ou usos inadequados que ameacem segurança ou qualidade devem ser comunicados às instâncias competentes. | Art. 7º, §2º | O fluxo institucional precisa prever notificação e aprendizagem com incidentes. | Alta |
| P09 | A resolução trabalha com classificação de riscos e governança proporcional. | Capítulos posteriores da norma | O mesmo controle não deve ser aplicado mecanicamente a todo uso de IA. | Média até leitura artigo por artigo |

## Campos obrigatórios para novas fontes

```yaml
source_id: string
title: string
issuer_or_authors: string
type: primary_norm | guideline | systematic_review | technical_document | commentary
publication_date: YYYY-MM-DD
verified_at: YYYY-MM-DD
url_or_doi: string
supports:
  - proposition_id
limitations: string
reviewer: string
status: candidate | verified | rejected
```

## Fontes a verificar antes da versão pública

- texto completo e retificação da Resolução CFM nº 2.454/2026;
- Código de Ética Médica vigente;
- LGPD e orientações pertinentes sobre dados pessoais sensíveis;
- normas da Anvisa aplicáveis a software como dispositivo médico, quando pertinentes ao caso;
- normas de telemedicina, quando o caso envolver comunicação ou cuidado remoto;
- documentação técnica das ferramentas demonstradas;
- literatura primária sobre segurança, viés, calibração e avaliação clínica de sistemas de IA.

## Proibição editorial

Não converter interpretação razoável em “exigência expressa do CFM”. Distinguir sempre:

1. texto normativo;
2. interpretação operacional;
3. recomendação prudencial da VIA;
4. hipótese ainda dependente de revisão externa.
