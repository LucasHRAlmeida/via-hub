# Curso IA-CFM — governança clínica do uso de inteligência artificial

> **Status:** rascunho interno para autoformação de Dr Lucas HR  
> **Branch:** `course/ia-cfm-pipeline`  
> **Publicação/deploy:** proibidos nesta etapa  
> **Fonte de verdade:** este diretório, versionado no GitHub

## Tese operacional

Este não é um curso de prompts. É uma formação sobre **governança clínica do uso de inteligência artificial**, orientada por responsabilidade médica, utilidade verificável, proporcionalidade ao risco, documentação e supervisão humana.

A Resolução CFM nº 2.454/2026 funciona como marco regulatório e caso de aplicação. A proposta não é explorar ansiedade normativa, mas transformar princípios abstratos em condutas clínicas e institucionais defensáveis.

## Objetivo da fase atual

Preparar o curso primeiro para o próprio autor, que deve atravessá-lo como:

1. aluno — dominar norma, conceitos e casos;
2. auditor — testar precisão, lacunas e riscos;
3. docente — explicar com clareza e demonstrar utilidade;
4. designer de sistema — converter conteúdo em frameworks auditáveis.

## Estrutura

```text
curso-ia-cfm/
├── README.md
├── curriculum/
│   └── course.yaml
├── sources/
│   └── SOURCE_REGISTER.md
├── modules/
│   ├── 00-enquadramento.md
│   └── 01-resolucao-cfm.md
├── artifacts/
│   ├── manifesto.md
│   ├── checklist-uso-governado.md
│   └── template-prontuario.md
├── prompts/
│   └── pipeline-redacao.md
├── evals/
│   └── quality-gates.yaml
└── landing/
    └── offer-draft.md
```

## Pipeline editorial

```text
fonte primária
  ↓
extração de proposições verificáveis
  ↓
tradução para implicações clínicas
  ↓
redação didática
  ↓
revisão adversarial
  ↓
auditoria factual e normativa
  ↓
artefatos derivados
```

A apostila será a saída primária. Slides, FAQ, posts AEO, roteiro de aula e landing serão derivados dela. Não haverá múltiplas fontes concorrentes para o mesmo conteúdo.

## Critérios de pronto

A versão interna somente poderá ser considerada pronta quando Dr Lucas HR conseguir, sem consulta:

- explicar em 90 segundos por que o curso não é sobre prompts;
- resumir a norma em cinco implicações operacionais;
- distinguir uso administrativo, educacional, assistencial indireto e assistencial sensível;
- demonstrar uso ingênuo versus uso governado;
- aplicar o checklist a um caso clínico;
- justificar quando o uso merece registro no prontuário;
- apresentar uma demonstração do Guia do Plantonista em sete minutos;
- declarar limites e incertezas sem linguagem defensiva vazia.

## Restrições desta branch

- não criar workflow de deploy;
- não alterar configuração do GitHub Pages;
- não fundir em `main` sem revisão explícita;
- não publicar landing, preço ou data como oferta definitiva;
- não usar dados reais identificáveis de pacientes;
- não apresentar modelos de registro como fórmulas oficiais do CFM.

## Fonte normativa inicial

- Conselho Federal de Medicina. **Resolução CFM nº 2.454, de 11 de fevereiro de 2026** — normatiza o uso da inteligência artificial na medicina. Publicação no DOU em 27/02/2026, com retificação publicada em 05/03/2026.

## Próximos marcos

1. completar leitura artigo por artigo da resolução;
2. preencher a matriz de proposições e implicações;
3. redigir os módulos 2 a 6;
4. construir caso sintético de dor abdominal;
5. testar checklist e template de registro;
6. produzir apostila v0.1;
7. ensaiar aula interna antes de qualquer oferta pública.
