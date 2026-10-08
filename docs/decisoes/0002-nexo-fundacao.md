# ADR 0002 — Fundação estática do Nexo, adaptador WhatsApp diferido

- Status: proposta (aguarda decisão do mantenedor via PR)
- Data: 2026-10-04
- Contexto: pedido do mantenedor para criar o bot Nexo no ambiente LucasHRAlmeida, com acesso a evidências biomédicas de alta qualidade e às diretrizes de sociedades médicas brasileiras, servindo material curado do Git, posicionamento técnico-filosófico e proposta de modelo de cuidado, com voz autoral uniforme e telos no ikigai do fundador.

## Decisão proposta

Versionar no `via-hub` apenas a fundação estática e auditável do Nexo (`nexo/`): contrato legível por máquina, regras de curadoria com prioridade para diretrizes brasileiras, guia de voz autoral nos três registros (cidadão, médico, fundador) e protocolo de avaliação sem backend.

## O que fica diferido (exige decisão substantiva nova)

Operação no WhatsApp Business: conta, número, provedor, webhook, templates Meta, hospedagem, segredos e revisão de privacidade/LGPD. Nada disso é criado, configurado ou presumido neste PR. O `contrato-nexo.json` documenta a interface futura sem implementá-la.

## Consequências

- O Nexo nasce herdando os invariantes do ADR 0001: fonte separada da ferramenta, estágio e limites declarados, software como argumento verificável.
- Curadoria clínica só com fonte registrada (entidade, edição/versão, datas, referência pública); sem fonte, abstinência declarada.
- Nenhum dado pessoal é pedido, capturado ou persistido por esta fundação.
- O mantenedor informa que o canal WhatsApp já está ativo externamente; este repositório não verifica essa configuração. A implementação do adaptador próprio fica diferida para proposta quando o mantenedor ordenar, com os segredos e a infraestrutura resolvidos fora do repositório.
