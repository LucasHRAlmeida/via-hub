# Pipeline de redação — Curso IA-CFM

## Finalidade

Transformar fontes primárias e literatura técnica em uma apostila didática, auditável e reutilizável, sem permitir que fluência retórica substitua verificação.

## Unidade de trabalho

Cada módulo deve ser produzido a partir de um pacote com:

```yaml
module_id: M0-M6
question: string
source_ids: []
propositions: []
clinical_implications: []
uncertainties: []
examples: []
artifacts_to_generate: []
```

## Passo 1 — Extração normativa

### Instrução

Leia apenas as fontes indicadas. Extraia proposições atômicas e identifique artigo, parágrafo ou seção. Não interprete ainda. Não use conhecimento de memória para completar lacunas.

### Saída

```yaml
propositions:
  - id: PXX
    source_id: CFM-2454-2026
    location: "Art. X, §Y"
    proposition: "..."
    direct_or_inferred: direct
    confidence: high
```

### Gate

Rejeitar qualquer proposição sem localização verificável.

## Passo 2 — Tradução operacional

### Instrução

Para cada proposição, descreva possíveis implicações para:

- médico individual;
- prontuário;
- paciente;
- instituição;
- produto digital;
- ensino médico.

Separe obrigação expressa de recomendação prudencial.

### Saída

```yaml
implications:
  - proposition_id: PXX
    audience: physician
    implication: "..."
    status: explicit_requirement | reasonable_interpretation | via_recommendation
    uncertainty: "..."
```

## Passo 3 — Redação didática

### Instrução

Escreva para médicos que precisam compreender e aplicar. Comece pela decisão prática, depois apresente fundamento, exceções, controvérsias e exemplo. Evite juridiquês e simplificação enganosa.

### Estrutura padrão

1. pergunta clínica ou operacional;
2. conclusão principal;
3. base normativa/técnica;
4. aplicação prática;
5. exceções e limites;
6. caso ou contraste;
7. exercício de domínio.

## Passo 4 — Revisor adversarial

### Instrução

Tente invalidar o texto. Procure:

- extrapolação da norma;
- confusão entre direito, dever e boa prática;
- promessa de segurança não demonstrada;
- linguagem promocional disfarçada de conclusão;
- ausência de exceções;
- documentação excessiva sem ganho clínico;
- tecnofilia ou tecnofobia;
- exemplo que induza registro de fato não observado;
- risco de uso com dado identificável.

### Saída

```yaml
findings:
  - severity: critical | major | minor
    location: string
    finding: string
    required_fix: string
```

## Passo 5 — Auditor factual

### Instrução

Mapeie cada frase factual relevante para uma fonte. Marque:

- `SUPPORTED` — fonte sustenta diretamente;
- `INFERRED` — inferência razoável, explicitamente rotulada;
- `UNSUPPORTED` — remover ou pesquisar;
- `OUTDATED` — rever fonte ou data.

Nenhum item `UNSUPPORTED` pode chegar à compilação final.

## Passo 6 — Editor final

### Instrução

Reduza redundância sem apagar nuance. Preserve distinções entre:

- texto da norma;
- interpretação;
- recomendação VIA;
- hipótese;
- exemplo.

Não transformar o curso em comentário jurídico. O centro é a prática clínica governada.

## Passo 7 — Derivação de artefatos

A partir do módulo aprovado, gerar:

- resumo de uma página;
- cinco perguntas de revisão;
- FAQ AEO;
- quadro comparativo;
- roteiro de 5 a 10 slides;
- exercício aplicado;
- snippet citável de até 80 palavras;
- material de apoio correspondente.

## Compilação

A compilação futura deverá gerar:

```text
dist/
├── apostila.md
├── roteiro-aula-120min.md
├── speaker-notes.md
├── faq.md
├── glossario.md
└── social/
    ├── substack.md
    ├── linkedin.md
    └── whatsapp.md
```

## Regra de parada

Interromper o pipeline quando:

- a fonte necessária não estiver disponível;
- houver conflito normativo não resolvido;
- a redação depender de aconselhamento jurídico individual;
- o exemplo exigir dados clínicos reais não adequadamente anonimizados;
- a utilidade do artefato não justificar sua complexidade.
