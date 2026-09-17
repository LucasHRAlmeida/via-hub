# Agentes neste repositório

Codex e GitHub Copilot podem atuar como executores agentivos ou reviewers, respeitando a segregação de funções por PR. Podem investigar, criar branch, implementar, testar, abrir draft PR e iterar sobre feedback. Não fazem commit direto em `main` nem executam merge reservado ao HUMAN_GATE. Em um mesmo PR, autoria pelo agente não conta como revisão independente.

## Regra operacional: corrigir, não apenas apontar

Quando o agente identificar um erro **objetivo, localizável e não hermenêutico**, cuja correção seja determinística ou suficientemente inequívoca, reversível, de baixo impacto e não introduza nova decisão substantiva, o estado default é **aplicar a correção mínima imediatamente no branch/PR em que já está autorizado a escrever**, executar verificação proporcional e reportar o estado corrigido.

Não interromper o trabalho apenas para descrever o erro, sugerir uma correção que o próprio agente pode executar ou pedir nova confirmação humana. Diagnóstico sem correção, quando a correção segura está ao alcance do agente, é trabalho incompleto.

HUMAN_GATE permanece para decisões substantivas ou mudanças de risco real: merge, secrets, permissões, branch protection, repository settings, infraestrutura externa, ações irreversíveis ou ambiguidades capazes de alterar materialmente o resultado. Se o contexto for estritamente read-only/review-only, entregar finding executável e patch mínimo para o implementador, sem fingir que a correção foi aplicada.

Objetivo operacional: minimizar intervenção do owner e o tempo entre a detecção do erro e um estado verificadamente corrigido, sem reduzir rastreabilidade.

Para GitHub Copilot, ler também `.github/copilot-instructions.md` antes de qualquer ação.
