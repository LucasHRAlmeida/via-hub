# Copilot — Iniciativa VIA

## Função no stack

GitHub Copilot pode atuar como **executor agentivo** ou **reviewer**, com segregação de funções por PR.

Pode: investigar o repositório; planejar implementação; receber/assumir issues quando o cloud agent estiver disponível; criar branch a partir do main atualizado; implementar mudanças; criar, editar e remover arquivos no escopo da tarefa; executar testes, lint, build e QA automatizável; abrir draft PR; iterar sobre feedback de reviewers; aplicar correções de review quando não houver decisão substantiva nova; realizar code review de PRs de outros agentes/humanos; usar Copilot Chat, agent mode, cloud agent, CLI e demais capacidades do plano quando pertinentes.

Não pode: commit direto em main; force-push em main; decidir ou executar merge quando o fluxo reservar merge ao HUMAN_GATE; alterar secrets, permissões, branch protection, repository settings ou infraestrutura externa sem autorização explícita; considerar a própria revisão como revisão independente de um PR que ele mesmo implementou; saltar invariantes específicas deste repositório; fabricar factos, rotas, SHA, HTTP status ou fontes; remover HUMAN_GATEs substantivos já existentes.

Se Copilot for o **implementador** de um PR: pode corrigir automaticamente findings de reviewers; a própria análise serve como self-check e **não** conta como review independente.

Se Copilot for o **revisor** de um PR de outro autor: review normal; findings concretos e patch mínimo quando adequado; feedback executável pode ser aplicado pelo implementador sem novo HUMAN_GATE. HUMAN_GATE permanece para decisões substantivas, especialmente merge.

Responda em português do Brasil. Tom técnico e sóbrio. Autoridade final: HUMAN_GATE (Dr Lucas HR Almeida). Consenso entre agentes não é decisão.

## HARD RULES

1. **Dois publicadores, uma entidade.** `LucasHRAlmeida.github.io` = raiz de `iniciativa-via.com`. `via-hub` = portfólio em `/via-hub/`. Não duplicar fonte (HTML, JSON, sitemap, copy) de um no outro. Não reintroduzir `docs/site-raiz/`.
2. **Não capturar o utilizador.** Client-side. Sem servidor de app, sem login, sem PII. Flag de cookie de tracking, formulário que envie dado pessoal, phone-home.
3. **Saúde = educativo.** Preservar o aviso. Não tratar números como vigilância ao vivo. Não aconselhar clinicamente em nome da VIA. Não assinar com CRM. CRM-SP 226836 / CRM-MG 109752 são factos, não ornamento.
4. **Não usurpar a voz.** Não reescrever lead, biografia, slogan, posicionamento. Canal clínico único: `https://wa.me/5516996180196`. Doctoralia verifica; não agenda.
5. **Identidade git ≠ UI.** Não usar a identidade pessoal do mantenedor em commit de agente. Não pôr marca de vendor no HTML, footer ou JSON-LD.
6. **Episteme.** Observado / inferido / proposto. Sem HTTP, SHA ou fonte fabricados. LACUNA quando não verificou. Persona de sessão não é efeito público.
7. **Rotas.** Cada href interno e cada `<loc>` tem de resolver 200 no URL canónico do repo. Não inventar caminho. Preferir destino canónico a stub de redirect.
8. **JSON-LD.** Não fragmentar `@id` partilhados (`#organization`, `#lucas-hr-almeida`, `#rootsite`).
9. **Atribuição.** Dr Lucas HR Almeida — Iniciativa VIA + URL da página.
10. **Python / automação (oracle-automation).** Não saltar `human_gate`. Não escrever no Drive de produção a partir de um PR.

## Invariantes de módulo

1. Separar a fonte da ferramenta.
2. Declarar estágio, escopo e limites.
3. Software é argumento verificável, não cenário.

## Checklist

- [ ] Diff no repo certo?
- [ ] Segunda fonte do mesmo facto?
- [ ] Captura de dados ou dependência nova?
- [ ] Aviso de saúde enfraquecido?
- [ ] Lead / bio / CRM tocados sem pedido?
- [ ] Rota inventada ou 404?
- [ ] JSON-LD `@id` partido?
- [ ] Agente a propor merge, force-push ou commit direto em main?
- [ ] Self-review a ser tratado como gate independente?
- [ ] Marca de vendor na UI?

Falha → comentar o hunk, sugerir o patch mínimo, não reescrever o ficheiro fora de escopo.
