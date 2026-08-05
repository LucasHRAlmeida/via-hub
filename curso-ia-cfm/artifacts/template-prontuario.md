# Template proporcional de registro do uso de IA no prontuário

> **Versão interna 0.1.** Modelo educacional proposto pela VIA. Não é fórmula oficial, não deve ser usado automaticamente e não substitui políticas institucionais nem avaliação individual do caso.

## Princípio

Registrar o uso de IA apenas quando sua participação for clinicamente relevante ou quando políticas institucionais o exigirem. O registro deve refletir o que realmente ocorreu, sem simular exame, comunicação, consentimento ou revisão inexistentes.

## Estrutura mínima sugerida

```text
Utilizada ferramenta de inteligência artificial para [FINALIDADE].
Foram fornecidos [TIPOS DE DADOS, SEM IDENTIFICADORES DESNECESSÁRIOS].
A ferramenta participou como [ORGANIZAÇÃO / RECUPERAÇÃO DE INFORMAÇÃO / APOIO AO RACIOCÍNIO / OUTRO].
A saída foi revisada criticamente à luz de [HISTÓRIA / EXAME / EXAMES / DIRETRIZES / CONTEXTO].
Impacto sobre a decisão: [NULO / ACESSÓRIO / RELEVANTE].
Decisão final definida pelo médico assistente.
Limitações ou divergências relevantes: [DESCREVER OU “NÃO IDENTIFICADAS”].
```

## Versão curta — participação acessória

```text
Ferramenta de IA utilizada como apoio à organização das informações clínicas, sem definição autônoma de diagnóstico ou conduta. Conteúdo revisado pelo médico assistente; decisão final baseada na avaliação clínica e nos dados disponíveis.
```

## Versão intermediária — participação relevante

```text
Ferramenta de IA utilizada para apoio à revisão de hipóteses e identificação de dados clínicos faltantes. As sugestões foram confrontadas com história, exame físico, exames complementares e referências pertinentes. Foram aproveitados os seguintes elementos: [DESCREVER]. Foram rejeitados ou modificados: [DESCREVER]. A decisão diagnóstica e terapêutica final foi definida pelo médico assistente.
```

## Versão estruturada — auditoria institucional

```yaml
ai_use:
  occurred: true
  date_time: YYYY-MM-DDThh:mm
  tool_name: ""
  tool_version_or_model: "desconhecido | informar"
  purpose:
    - documentation
    - information_retrieval
    - clinical_reasoning_support
    - other
  data_shared:
    identifiable_data: false
    categories: []
  role:
    - organization
    - suggestion
    - calculation
    - summarization
  clinician_review:
    performed: true
    checked_against: []
    accepted_elements: []
    rejected_elements: []
  decision_impact: none | accessory | relevant
  patient_information:
    required_or_applicable: uncertain | no | yes
    performed: false
    notes: ""
  limitations: []
  incident_detected: false
```

## Quando evitar o template

Não usar este modelo para:

- registrar retrospectivamente uma revisão que não ocorreu;
- documentar exame físico gerado por IA;
- insinuar que o sistema é certificado ou aprovado sem evidência;
- substituir justificativa clínica específica;
- inserir no prontuário detalhes técnicos sem relevância assistencial;
- produzir aviso padronizado para todo uso administrativo de baixo impacto;
- transferir a responsabilidade com expressões como “conduta conforme IA”.

## Perguntas antes de registrar

1. A IA influenciou materialmente o cuidado ou apenas auxiliou uma tarefa periférica?
2. O registro ajudará continuidade, transparência, auditoria ou segurança?
3. O texto descreve fato real e verificável?
4. Há risco de o registro criar falsa impressão de validação da ferramenta?
5. O nível de detalhe é proporcional ao risco e ao impacto?

## Frase proibida

```text
Conduta definida conforme recomendação da inteligência artificial.
```

Problemas: transfere autoria, não informa revisão, não descreve ferramenta, contexto, limites ou raciocínio clínico.

## Frase preferível

```text
A ferramenta de IA foi utilizada como apoio à revisão do caso; suas sugestões foram criticamente avaliadas e parcialmente incorporadas após confronto com os dados clínicos. A decisão final foi definida pelo médico assistente.
```

Mesmo essa redação só deve ser usada quando verdadeira.
