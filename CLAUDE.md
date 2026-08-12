# Instruções de projeto — via-hub

Este arquivo é lido automaticamente por sessões do Claude Code operando neste repositório.

## Identidade git obrigatória para commits de agente

Antes de qualquer `git commit` nesta sessão, configure a identidade local do repositório (não altera a configuração global do usuário):

```bash
git config user.name "VIA Agent (Claude Code)"
git config user.email "noreply@anthropic.com"
```

Nunca commite usando a identidade git pessoal herdada do ambiente (nome ou e-mail pessoal do mantenedor), mesmo que esteja configurada globalmente na máquina onde a sessão roda. Se a configuração local do repositório já estiver correta (sessões cloud do Claude Code normalmente já usam `Claude <noreply@anthropic.com>`), não é necessário alterar nada.

## Tom de commits e PRs

Registro técnico e sóbrio, adequado a um repositório público institucional. Evite linguagem coloquial, primeira pessoa conversacional e jargão interno não explicado sem definição.

## Merge em `main`

Não faça merge de PRs em `main`. Abra o PR, descreva o que mudou e o que foi validado, e aguarde decisão humana explícita do mantenedor.

Política completa: ver `CONTRIBUTING.md`.
