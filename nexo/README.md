# Nexo — fundação versionada do agente VIA para WhatsApp Business

Estágio: fundação estática em curadoria. Não é um bot em operação.

O Nexo é o nome do agente da Iniciativa VIA previsto para operar embarcado no WhatsApp Business. Este diretório versiona a fundação auditável desse agente: contrato legível por máquina (`contrato-nexo.json`), regras de curadoria (`CURADORIA.md`), guia de voz autoral (`VOZ_AUTORAL.md`) e protocolo de avaliação (`avaliacao.md`). Nenhum arquivo aqui envia mensagens, recebe webhooks ou captura dados pessoais.

## O que esta fundação entrega

- Três raias de resposta com limites próprios: informação em saúde, posicionamento técnico-filosófico e proposta de modelo de cuidado.
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
- `VOZ_AUTORAL.md` — registro de voz do fundador como cidadão, médico e fundador da Iniciativa.
- `avaliacao.md` — matriz de coerência entre frentes e protocolo de verificação sem backend.
- `../docs/decisoes/0002-nexo-fundacao.md` — decisão arquitetural que fixa este escopo.

## Verificação

```bash
node tests/nexo-contrato.test.cjs
```

O teste valida invariantes selecionados do contrato e a presença dos documentos. Também procura seis padrões literais de possíveis segredos em `nexo/` e no ADR 0002; essa varredura não é um detector geral de segredos nem verifica a integridade editorial dos documentos. As verificações gerais do repositório continuam em `.github/workflows/testes.yml`.
