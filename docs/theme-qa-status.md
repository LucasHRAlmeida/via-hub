# Status de QA — tema claro/escuro

**AGUARDANDO QA VISUAL HUMANA — DR. PARNASSUS**

Branch: `fix/theme-accessibility-postmerge`

Correção técnica aplicada: o botão mantém rótulo de ação variável (`Usar tema claro` / `Usar tema escuro`) e não expõe `aria-pressed`, eliminando a semântica contraditória apontada pelo revisor.

A sincronização de `reset()` entre abas permanece implementada pelo tratamento de `event.newValue === null`.

QA solicitada ao mantenedor: conferir visualmente modo claro/escuro, desktop/mobile, foco de teclado, sobreposição do botão, contraste e regressões de layout. Checklist completo em `docs/theme-qa.md`.

Nenhuma decisão de integração deve ser inferida a partir desta marcação de QA.
