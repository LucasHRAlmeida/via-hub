# Revisão técnica solicitada — correção pós-merge do tema

Escopo da revisão:

1. Confirmar que o finding P2 sobre `aria-pressed` foi resolvido sem introduzir regressão de acessibilidade.
2. Confirmar que a sincronização entre abas, inclusive `reset()` com `newValue === null`, permanece correta.
3. Revisar `tests/theme-regression.js` e apontar lacunas relevantes.
4. Não autorizar merge automaticamente.

Regra operacional: qualquer finding técnico executável retornado pelo revisor deve ser aplicado automaticamente pelo executor e submetido novamente à verificação. HUMAN_GATE fica reservado às decisões substantivas explicitamente protegidas.
