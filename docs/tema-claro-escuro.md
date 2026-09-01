# Tema claro/escuro — implementação em revisão

Origem: `PROP-20260828-CLAUDE-NG16ZG-001` (re-ID da proposta originalmente colidente como CLAUDE-004).

Decisão humana em 30/08/2026: **ACEITAR E PREPARAR PR, SEM MERGE**.

O PR #30 introduziu o núcleo compartilhado (`assets/theme.js` e `assets/theme.css`) antes da propagação mecânica para todas as páginas do hub. O artefato-patch produzido na sessão Claude de 28/08/2026 não está persistido como arquivo recuperável no Drive/GitHub; apenas seu hash e o endereço do artefato efêmero permanecem registrados. Por isso, esta implementação não finge aplicar bytes que não foram recuperados.

O PR #30 foi incorporado manualmente pelo próprio mantenedor em 31/08/2026. O ato constituiu revogação deliberada da condição “sem merge”, motivada por panes não resolvidas, mas não recebeu registro contemporâneo. `RUN-20260901-CLAUDE-PR30-DIVERG-001` resolveu a divergência e `DEC-20260901-002` corrigiu o estado canônico: defeito registral, não violação de mandato. A decisão superveniente `DEC-20260901-001` preserva o núcleo provisoriamente e determina correções técnicas em novo PR, sem autorizar outro merge. A aceitação visual e definitiva permanece condicionada à QA humana.

## Invariantes

- nenhuma coleta ou transmissão de preferência: `localStorage` apenas;
- preferência explícita do usuário > preferência do sistema;
- botão com alvo mínimo de 44 px, rótulo de ação em PT-BR e sem `aria-pressed`, pois o nome anuncia a ação seguinte em vez do estado atual;
- oculto em impressão;
- sincronização entre abas e atualização de `theme-color`;
- sem dependências e sem build;
- nenhum novo merge automático.

## Próxima etapa antes de novo merge

1. Propagar o controlador contra o `main` atual, página a página, usando tokens semânticos em vez de inversão direta de paleta.
2. Preservar páginas de paleta fixa quando a inversão produzir degradação visual.
3. Executar QA desktop **e mobile**, contraste WCAG, teclado e regressão visual do modo claro.
4. Corrigir apenas defeitos atribuíveis a esta mudança; dívida de contraste preexistente fica separada.
5. Revisão obrigatória por Codex e GitHub Copilot antes de qualquer decisão de merge.
6. Submeter uma superfície visual verificável ao Dr Lucas HR Almeida para QA humana.

Estado: **NÚCLEO MERGEADO SEM CONSUMIDOR / CORREÇÃO PÓS-MERGE EM REVIEW / QA VISUAL PENDENTE**.
