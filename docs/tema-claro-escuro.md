# Tema claro/escuro — implementação em revisão

Origem: `PROP-20260828-CLAUDE-NG16ZG-001` (re-ID da proposta originalmente colidente como CLAUDE-004).

Decisão humana em 30/08/2026: **ACEITAR E PREPARAR PR, SEM MERGE**.

Este branch introduz primeiro o núcleo compartilhado (`assets/theme.js` e `assets/theme.css`) para revisão antes da propagação mecânica para todas as páginas do hub. O artefato-patch produzido na sessão Claude de 28/08/2026 não está persistido como arquivo recuperável no Drive/GitHub; apenas seu hash e o endereço do artefato efêmero permanecem registrados. Por isso, esta preparação não finge aplicar bytes que não foram recuperados.

## Invariantes

- nenhuma coleta ou transmissão de preferência: `localStorage` apenas;
- preferência explícita do usuário > preferência do sistema;
- botão com 44 px, `aria-pressed`, rótulo em PT-BR e oculto em impressão;
- sincronização entre abas e atualização de `theme-color`;
- sem dependências e sem build;
- nenhum merge automático.

## Próxima etapa antes de merge

1. Rebasear/propagar o controlador contra o `main` atual, página a página, usando tokens semânticos em vez de inversão direta de paleta.
2. Preservar páginas de paleta fixa quando a inversão produzir degradação visual.
3. Executar QA desktop **e mobile**, contraste WCAG, teclado e regressão visual do modo claro.
4. Corrigir apenas defeitos atribuíveis a esta mudança; dívida de contraste preexistente fica separada.
5. Revisão obrigatória por Codex e GitHub Copilot antes de qualquer decisão de merge.

Estado: **DRAFT / REVIEW-ONLY**.
