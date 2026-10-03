# Agentes neste repositório

Agentes executam ordens do mantenedor dentro do escopo autorizado. Isso não implica extrapolar prerrogativas. Codex e GitHub Copilot podem atuar como executores agentivos ou reviewers, respeitando a segregação de funções por PR. Podem investigar, criar branch, implementar, testar, abrir draft PR e iterar sobre feedback. Não fazem commit direto em `main`. Em um mesmo PR, autoria pelo agente não conta como revisão independente.

## Decisão humana e execução delegada

A decisão de integrar ou publicar uma mudança cabe ao mantenedor. O agente pode executar merge e publicação quando houver ordem humana expressa, vigente e pertinente à mudança, capacidade efetivamente disponível e verificações exigidas satisfeitas. HUMAN_GATE reserva a decisão, não impede sua execução delegada.

A autorização dada na conversa de trabalho é válida; o executor registra no PR seu escopo e origem, sem exigir que o mantenedor repita a ordem em outra interface. Não presumir autorização de merge apenas por ter recebido uma tarefa de implementação. Uma ordem não concede novos acessos nem autoriza alterações de permissões, proteções ou infraestrutura fora do escopo.

Cabe ao executor consolidar pendências, aplicar correções e verificar os efeitos. Consultar o mantenedor apenas sobre decisão substantiva ainda ausente ou impedimento concreto; não devolver a ele uma sequência de despachos técnicos executáveis pelo agente.

## Regra operacional: corrigir, não apenas apontar

Quando o agente identificar um erro **objetivo, localizável e não hermenêutico**, cuja correção seja determinística ou suficientemente inequívoca, reversível, de baixo impacto e não introduza nova decisão substantiva, o estado default é **aplicar a correção mínima imediatamente no branch/PR em que já está autorizado a escrever**, executar verificação proporcional e reportar o estado corrigido.

Não interromper o trabalho apenas para descrever o erro, sugerir uma correção que o próprio agente pode executar ou pedir nova confirmação humana. Diagnóstico sem correção, quando a correção segura está ao alcance do agente, é trabalho incompleto.

HUMAN_GATE permanece para decisões substantivas ainda não autorizadas ou mudanças de risco real: integração e publicação, secrets, permissões, branch protection, repository settings, infraestrutura externa, ações irreversíveis ou ambiguidades capazes de alterar materialmente o resultado. Uma decisão humana já dada pode ser executada pelo agente conforme a regra de execução delegada, sem nova confirmação pelo mesmo motivo. Se o contexto for estritamente read-only/review-only, entregar finding executável e patch mínimo para o implementador, sem fingir que a correção foi aplicada.

Objetivo operacional: minimizar intervenção do owner e o tempo entre a detecção do erro e um estado verificadamente corrigido, sem reduzir rastreabilidade.

O mantenedor é médico e não deve receber como tarefa a edição manual de código, a regeneração de artefatos ou a aplicação de sugestões de review. Em mudanças com fonte canônica e saídas geradas, identificar a fonte, editá-la, regenerar todas as saídas e verificar ausência de divergência antes de declarar conclusão. Quando houver permissão de escrita no PR, findings objetivos do Codex/Copilot são itens de execução no próprio branch; comunicar apenas o resultado e eventual decisão substantiva pendente. Não acionar serviços ou créditos pagos adicionais para tentativas repetitivas sem necessidade demonstrada; registrar limites reais de acesso e custo quando conhecidos. Esta regra instrui agentes no repositório, sem alterar configurações de cobrança da plataforma.

Para GitHub Copilot, ler também `.github/copilot-instructions.md` antes de qualquer ação.

## Ambiente local

O hub é um site estático: não há build nem dependências de pacote. A pré-visualização documentada em `README.md` usa `python -m http.server 8000`. Nesta imagem o executável do sistema é `python3`; o `install` do ambiente de Cloud Agent cria o alias `python` em `/usr/local/bin` e expõe o Node do nvm em `/usr/local/bin`, porque shells de login não interativos não carregam `~/.bashrc`.

As verificações do workflow `.github/workflows/testes.yml` são o contrato de teste geral. Em mudanças que tocam `scripts/revista/**`, `revista/edicao-*.md` ou `.github/workflows/revista-promote.yml`, o job `validate` de `.github/workflows/revista-promote.yml` também faz parte do contrato: regenera a edição corrente e falha se `revista/index.html` ficar divergente. O conversor em `regulacao-federal-ia/evam` não declara dependências npm; `npm test` apenas executa o test runner do Node.

O script `start` do ambiente sobe `python3 -m http.server 8000 --bind 0.0.0.0` a partir de `/workspace` e termina sem erro se a porta já estiver em uso.
