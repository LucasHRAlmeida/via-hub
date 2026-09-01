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

## Prévia visual privada

A QA humana usa um HTML autossuficiente entregue diretamente ao Dr Lucas HR Almeida, fora da árvore servida pelo GitHub Pages. O finding P1 do Codex demonstrou que `noindex` não impede publicação ou acesso: portanto, `qa/theme-preview/index.html` foi removido do repositório.

O contrato `tests/theme-preview.test.cjs` verifica mecanicamente que:

- não existe fixture de QA dentro da árvore potencialmente publicada;
- `assets/theme.css` e `assets/theme.js` existem;
- nenhuma página HTML real consome esses assets antes de deliberação específica.

Aprovar a prévia privada não equivale a aprovar a propagação página a página nem autoriza merge.

## Próxima etapa antes de novo merge

1. Obter QA visual humana do artefato privado em desktop e mobile, claro e escuro.
2. Propagar o controlador contra o `main` atual, página a página, somente após deliberação específica.
3. Preservar páginas de paleta fixa quando a inversão produzir degradação visual.
4. Executar contraste WCAG, teclado e regressão visual do modo claro nas páginas consumidoras.
5. Corrigir apenas defeitos atribuíveis a esta mudança; dívida de contraste preexistente fica separada.
6. Revisão obrigatória por Codex e GitHub Copilot antes de qualquer decisão de merge.

Estado: **PRÉVIA PRIVADA FORA DO PAGES / QA VISUAL HUMANA PENDENTE / NENHUM NOVO MERGE**.
