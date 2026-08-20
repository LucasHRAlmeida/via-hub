# VIA Federal Regulation Lab — V1.0

Sandbox público e sintético associado ao módulo `regulacao-federal-ia`.

## Objetivo

Tornar discutível e auditável o contrato computacional de uma futura camada de apoio à regulação de urgências: necessidade clínica + janela terapêutica + capacidade executora + logística + incerteza.

## V1.0 pública

- 100% client-side.
- Nenhum login, backend ou persistência.
- Apenas casos sintéticos.
- Matching heurístico deliberadamente simples e visível.
- Demonstra `abstention` quando falta dado crítico.
- Exibe trilha de raciocínio separando fatos, regra dura, proxy de urgência e incerteza não modelada.
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
- **Vercel**: candidato preferencial para o laboratório restrito de cowork, previews, funções server-side e observabilidade.
- **Cloudflare**: DNS canônico; Access/Workers apenas quando houver requisito concreto de identidade institucional, policy enforcement no edge ou intermediação de APIs.

## Interface científica com C4AI

A equipe clínica define o mundo representado — estados clínicos, temporalidade, capacidades executoras, regras, exceções, casos e métricas. O C4AI é convidado a co-desenhar os formalismos para representação do conhecimento, raciocínio sob incerteza, programação lógica probabilística, redes credais e arquiteturas neuro-simbólicas.
