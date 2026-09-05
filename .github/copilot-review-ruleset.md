# Copilot code review

Copilot code review permanece habilitado e é independente da autorização para uso do Copilot como coding/cloud agent. Review automático de código do próprio Copilot é self-check e não substitui review independente.

A API deste conector não cria ruleset. O mantenedor liga à mão.

Em cada repo: Settings → Rules → New ruleset → Branch.

- Target: default branch.
- Enable Copilot code review.
- Review new pushes = ligado.
- Effort default: Balanced.
- Required reviewers humanos: o mantenedor. Copilot não conta como reviewer independente do próprio PR.
- Não ativar auto-merge por esta política.
- Não reduzir proteções de main.

Pedir revisão: copilot-pull-request-reviewer[bot], ou `gh pr edit N --add-reviewer @copilot`.
