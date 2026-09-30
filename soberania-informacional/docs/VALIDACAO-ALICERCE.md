# Validação do alicerce

Data: 2026-09-30 · Executor: Codex · Verificação do autor, sem revisão independente

## Executado e aprovado localmente

- node tests/escala-movel.test.cjs
- node tests/theme-toggle.test.cjs
- node tests/theme-preview.test.cjs
- node tests/revista-x-links.test.cjs
- node tests/static-routes.test.cjs — 35 páginas HTML verificadas, incluindo as duas novas.
- npm test --prefix regulacao-federal-ia/evam — 14 testes aprovados.
- Parsing dos JSONs e XML do sitemap.
- Conferência dos campos obrigatórios, enumeração e TTL do modelo de contribuição contra o contrato declarado; esta checagem não usou um validador completo de JSON Schema.
- Missões abertas sem responsáveis ou agendamentos fictícios; valores quantitativos ausentes preservados como null.
- PDF recebido preservado: 83001 bytes, SHA-256 d0944a58cc0378fabff75b5175282280b9590e507a40be7187b7052adb9402a9.

## LACUNA — verificação visual

A CLI agent-browser não está instalada. Playwright está disponível, mas o binário de Chromium não está instalado, nem foi encontrado navegador do sistema.
A tentativa terminou antes de abrir uma página. Não houve screenshot nem inspeção visual em desktop/celular.
Completar essa etapa em ambiente com navegador, sob a missão VIA-SOB-004, antes da publicação.

## Pendências de publicação

- Revisão por outro autor quando aplicável.
- Merge mediante decisão humana explícita, conforme AGENTS.md e CONTRIBUTING.md.
- Após merge: conferir deploy, respostas HTTP e acesso às duas portas a partir do módulo.

