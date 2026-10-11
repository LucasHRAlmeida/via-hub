# Nexo — fundação versionada do agente VIA para WhatsApp Business

Este repositório contém a fundação estática e auditável do Nexo. O mantenedor informa que o assistente já está ativo no WhatsApp Business via assistente de empresas da Meta; essa integração e sua configuração não são verificadas nem sincronizadas por este repositório.

O Nexo é o assistente da Iniciativa VIA. Este diretório versiona seu contrato legível por máquina (`contrato-nexo.json`), regras de curadoria (`CURADORIA.md`), guia de voz autoral (`VOZ_AUTORAL.md`), protocolo de avaliação (`avaliacao.md`) e fonte única de instruções operacionais (`SSOT_OPERACAO.md`). Os arquivos deste repositório não enviam mensagens nem recebem webhooks.

## O que esta fundação entrega

- Quatro raias de resposta com limites próprios: informação em saúde, posicionamento técnico-filosófico, proposta de modelo de cuidado e educação em saúde para leigos.
- Hierarquia de fontes com exigência de citação versionada, com prioridade para diretrizes de sociedades médicas brasileiras quando o tema for coberto por elas.
- Limites clínicos e de privacidade herdados da tese fundadora (ADR 0001): separar fonte e ferramenta, declarar estágio e limites, tratar software como argumento verificável.
- Interface documentada para um adaptador WhatsApp futuro, sem implementá-lo neste repositório estático.

## O que está explicitamente fora do escopo

- Operação no WhatsApp Business (conta, número, provedor, webhook, aprovação de templates Meta). Exige decisão substantiva do mantenedor, segredos fora do repositório e revisão de privacidade/LGPD.
- Diagnóstico, prescrição, definição de conduta individual, triagem de urgência. O Nexo informa e calibra juízo; conduta cabe à relação médico-paciente.
- Acesso automático a diretrizes pagas ou restritas. Só entra no corpus o que for publicamente verificável ou explicitamente licenciado ao projeto, com edição, versão e data registradas.

## Estrutura

- `contrato-nexo.json` — contrato canônico: identidade, raias, hierarquia de fontes, limites, interface do adaptador futuro.
- `CURADORIA.md` — como curar, citar, versionar e aposentar fontes.
- `FONTES_EDUCACAO_SAUDE.md` — índice canônico de fontes públicas e gratuitas de educação em saúde para leigos.
- `VOZ_AUTORAL.md` — registro de voz do fundador como cidadão, médico e fundador da Iniciativa.
- `avaliacao.md` — matriz de coerência entre frentes e protocolo de verificação sem backend.
- `SSOT_OPERACAO.md` — instruções canônicas para fornecer manualmente ao assistente externo da Meta.
- `../docs/decisoes/0002-nexo-fundacao.md` — decisão arquitetural que fixa este escopo.

## Verificação

```bash
node tests/nexo-contrato.test.cjs
```

O teste valida invariantes selecionados do contrato, a presença dos documentos e a estrutura das 21 fichas de perguntas: estados permitidos, campos mínimos de fontes verificadas e estrutura da resposta conforme o estado. Também procura seis padrões literais de possíveis segredos em `nexo/` e no ADR 0002; essa varredura não é um detector geral de segredos nem verifica a integridade editorial dos documentos. As verificações gerais do repositório continuam em `.github/workflows/testes.yml`.
