# Contribuindo — via-hub

## Autoria de commits e PRs gerados por agentes de IA

Este repositório aceita PRs abertos por agentes de IA (Claude Code ou equivalente), sob as regras abaixo.

### Identidade git

Commits gerados por agente não devem usar a identidade git pessoal do mantenedor (nome ou e-mail pessoal).

Identidade padrão para commits de agente:

- `user.name`: `VIA Agent (Claude Code)`
- `user.email`: `noreply@anthropic.com`

Ver `CLAUDE.md` na raiz do repositório para a instrução operacional completa, lida automaticamente por sessões do Claude Code neste projeto.

### Corpo de commit e de PR

- Registro técnico e sóbrio, adequado a um repositório público institucional.
- Sem linguagem coloquial, sem jargão interno não explicado, sem tom de conversa informal.
- Estrutura mínima: o que muda, por que, o que foi validado, o que ficou fora do escopo.
- Identificar a origem como gerado por agente (rodapé padrão e link de sessão, quando aplicável).

### Merge em `main`

- PRs abertos por agente não autorizam, por si, seu merge.
- Merge requer decisão humana explícita do mantenedor. O agente pode executá-la quando a ordem vigente abranger a mudança e as verificações exigidas estiverem satisfeitas.
- A ordem pode ser dada na conversa de trabalho. O executor registra sua origem e escopo no PR, sem solicitar que o mantenedor a repita em outra interface. HUMAN_GATE reserva a decisão humana e admite execução delegada.
- Branch protection formal em `main` (revisão obrigatória antes de merge) é recomendada e está pendente de configuração em Settings → Branches.
