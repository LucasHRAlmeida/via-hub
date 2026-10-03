# VIA Federal Regulation Lab — V1.0

Sandbox público e sintético associado ao módulo `regulacao-federal-ia`.

## Objetivo

Tornar discutível e auditável o contrato computacional de uma futura camada de apoio à regulação de urgências: necessidade clínica + janela terapêutica + capacidade executora + logística + incerteza.

## Submódulo de entrada

O [EVAM Conversor](../evam/) recebe narrativa clínica livre, cria um envelope versionado por síndrome/especialidade, preserva proveniência e declara campos críticos ausentes. Ele prepara a entrada; este Lab demonstra o matching experimental. A separação evita misturar extração textual com decisão regulatória.

## V1.0 pública

- 100% client-side.
- Nenhum login, backend ou persistência.
- Apenas casos sintéticos.
- Matching heurístico deliberadamente simples e visível.
- Demonstra `abstention` quando falta dado crítico.
- **Pilot A (TTL + fila):** freshness `fresh|stale|expired` em inputs sintéticos; abstention se `expired`.
- **Limiar de fila por síndrome (demonstrativo):** CPRE/sepse biliar ≈ 2 dias; SCA/hemodinâmica e AVC/neuro ≈ 1 dia. **Não é parâmetro clínico fixo nem TTL operacional.** O preset «Extremo absurdo · 20 d na fila» ilustra estagnação absurda numa sepse biliar (janela curta); os 20 dias não definem limiar.
- **Score decomposto** no painel 2 e no raciocínio (painel 3): capacidade (regra dura +55/−100) + tempo + distância + urgência.
- Presets de um clique para as três recusas (dado ausente, TTL expired, fila estagnada) além do caso-âncora.
- Exibe trilha de raciocínio separando fatos, regra dura, decomposição, proxy de urgência e incerteza não modelada.
- Não é sistema assistencial nem algoritmo clinicamente validado.

## Próxima arquitetura de pesquisa

A versão colaborativa deverá separar:

1. **camada semântica** — FHIR/RNDS, terminologias e provenance;
2. **conhecimento explícito** — ontologia, regras e restrições;
3. **incerteza** — redes Bayesianas/credais e/ou programação lógica probabilística;
4. **aprendizado** — modelos estatísticos somente onde houver hipótese e dados adequados;
5. **política decisória** — matching, ranking, abstention e explicação;
6. **governança** — versionamento de regras, audit trail, override humano e benchmarking.

## Estratégia de deploy

- **GitHub**: fonte canônica do código.
- **GitHub Pages**: vitrine pública e sandbox sintético.
- **Cloudflare**: DNS canônico; Access/Workers apenas quando houver requisito concreto de identidade institucional, policy enforcement no edge ou intermediação de APIs.

## Interface científica com C4AI

A equipe clínica define o mundo representado — estados clínicos, temporalidade, capacidades executoras, regras, exceções, casos e métricas. O C4AI é convidado a co-desenhar os formalismos para representação do conhecimento, raciocínio sob incerteza, programação lógica probabilística, redes credais e arquiteturas neuro-simbólicas.
