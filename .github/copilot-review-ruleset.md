# Copilot = só revisão

A API deste conector não cria ruleset. O mantenedor liga à mão.

Em cada repo: Settings → Rules → New ruleset → Branch.

- Target: default branch.
- Enable Copilot code review.
- Review new pushes = ligado.
- Effort default: Balanced.
- Required reviewers humanos: o mantenedor. Copilot não conta.

Desligar neste stack: Copilot coding agent, assign Copilot to issue, «Corrigir com Copilot», auto-merge, MCP tools na revisão.

Pedir revisão: copilot-pull-request-reviewer[bot], ou `gh pr edit N --add-reviewer @copilot`.
