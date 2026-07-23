# Regulação Federal IA — Governança Sistêmica em Saúde

Proposta de arquitetura federativa para orquestração inteligente de transferências interestaduais de pacientes críticos no SUS, fundamentada em lições de segurança aeronáutica (AF447) e epistemologia clínica.

## Acesso

- **Briefing Interativo**: <https://lucashralmeida.github.io/via-hub/regulacao-federal-ia/>
- **Documentação Técnica**: [`docs/`](./docs/)
- **Portfólio VIA**: <https://lucashralmeida.github.io/via-hub/>

## Propósito

Este módulo articula três camadas de conhecimento:

1. **Diagnóstico Sistêmico** — Análise de um caso-sentinela (sepse biliar retida entre MG e SP) que expõe falhas de roteamento e interoperabilidade

2. **Analogia Operacional** — Aplicação de princípios de CRM (Crew Resource Management) do voo AF447 à tomada de decisão clínica sob estresse

3. **Proposta Técnica** — Framework de IA federativa que:
   - Rompe lógica regional para casos críticos
   - Roteia por recurso (tecnologia específica), não apenas proximidade
   - Integra corredores aeromédicos com FAB

4. **Episteme Clínica** — Fundação em Canguilhem, Nietzsche e phrónesis (sabedoria prática) para além do positivismo estatístico

## Arquivos

```
regulacao-federal-ia/
├── README.md                       # este arquivo
├── index.html                      # briefing interativo
├── docs/
│   ├── caso-sentinela.md          # análise técnica do colapso
│   ├── af447-lições.md            # framework CRM → clínica
│   ├── arquitetura-ia.md          # pilares técnicos
│   └── episteme-clinica.md        # fundação filosófica
└── .github/workflows/deploy.yml    # CI/CD GitHub Pages
```

## Princípios Editoriais (VIA)

1. **Separar fonte de ferramenta** — Conceitos filosóficos/clínicos distintos da interface
2. **Declarar estágio e limitações** — Não ocultar que é proposta conceitual, não implementação
3. **Evitar alegações não validadas** — Reduzir "AI hype"; focar em problema real
4. **Software como argumento** — Simulador NICE NG143 é teste vivo, não cenografia

## Desenvolvimento Local

Não há dependências externas. Na raiz de `via-hub`:

```bash
python -m http.server 8000
```

Depois:
```
http://localhost:8000/regulacao-federal-ia/
```

Ou abra `index.html` diretamente (GitHub Pages renderiza melhor).

## Conteúdo Interativo

- **Gráfico de Impacto** (Chart.js) — Comparação: caso real (144h) vs IA (4h) vs alvo terapêutico (6h)
- **Simulador de Triagem Pediátrica** (NICE NG143) — Botões verde/âmbar/vermelho com conduta automática
- **Tabela AF447** — Mapeamento checklist → estol clínico
- **Blocos Epistêmicos** — Canguilhem, Nietzsche, 3 níveis do sofrimento

## Escopo

**Cobre:**
- Diagnóstico do problema (roteamento e interoperabilidade)
- Framework conceitual (CRM + filosofia)
- Arquitetura de 3 pilares (IA federativa, roteamento, aeromédicos)

**Não cobre (próximos passos):**
- Implementação real em sistemas SUS
- Detalhamento de APIs interestaduais
- Análise de financiamento e governança

## Verificação Editorial

Ao atualizar:

1. Valide sintaxe HTML/CSS (Tailwind)
2. Teste navegação em mobile
3. Verifique gráficos em dark mode
4. Execute simulador NICE em todos os estados (verde/âmbar/vermelho)
5. Confirme que nenhum dado sensível (CPF, CNPJ) entrou no histórico
6. Atualize data no cabeçalho quando modificar conteúdo clínico

## Modelo Epistêmico

A saúde não é **ausência de doença** (Descartes), mas **capacidade de criar novas normas e colocar-se em risco** (Canguilhem). O sistema de regulação federal deve ser tão plástico quanto o corpo que cuida.

---

**Dr Lucas HR — Médico Generalista (FMRP-USP)**

CRM-SP: 226836 | CRM-MG: 109752

[WhatsApp Business: +55 16 99618-0196](https://wa.me/5516996180196)

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.
