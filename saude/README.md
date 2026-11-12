# VIA Saúde · Um percurso da Sala

Aplicativo estático independente em https://iniciativa-via.com/via-hub/saude/.
Não substitui a Sala em https://iniciativa-via.com/ nem o EVAM canônico.

## Escopo

- Cinco percepções do template Replit, com respostas opcionais, ausência explícita e exportação JSON demonstrativa.
- Curadoria segundo intenção declarada, sem interpretação clínica.
- EVAM local com seis templates, proveniência, excertos, revisão por campo e exportação.
- Consulta meteorológica real, voluntária, sem GPS, após selecionar UF e confirmar localidade. Fonte e tempo explícitos; valores são ocultados após expiração.
- Nenhuma chave no cliente, analytics, conta, armazenamento persistente ou transmissão de narrativas e respostas.
- Dados de saúde apenas sintéticos. Não constitui serviço assistencial nem dispositivo clínico validado.

## Fontes e continuidade

Template de referência: snapshot VS-2048, 18/06/2025:
https://ae208540-5f00-4375-8d55-5a5105258814-00-1lixydybys33b.kirk.replit.dev/profissional/VS-2048
O servidor original estava indisponível em 12/11/2026. Não houve acesso ao código Replit.

Sala e intenção curatorial:
https://iniciativa-via.com/
https://github.com/LucasHRAlmeida/LucasHRAlmeida.github.io/blob/main/CURATORIA.md

Motor EVAM: cópia mecânica dos módulos canônicos `../regulacao-federal-ia/evam/{parser,schemas}.js`.
Não é um parser paralelo. `node tests/saude.test.cjs` exige igualdade byte a byte.
Ao atualizar o EVAM canônico, sincronizar os dois módulos e executar os testes dos dois projetos.
Fonte pública: https://iniciativa-via.com/via-hub/regulacao-federal-ia/evam/

Clima:
https://open-meteo.com/en/docs
https://open-meteo.com/en/docs/geocoding-api
https://open-meteo.com/en/terms
Licença de dados: https://creativecommons.org/licenses/by/4.0/
Serviço gratuito apenas para uso não comercial e sujeito aos limites do fornecedor.
Antes de uso comercial ou público em escala, contratar o plano aplicável ou substituir a fonte.

## Operação e custo

Hospedagem: GitHub Pages já existente, sob domínio próprio, sem novos recursos pagos.
Sem chamadas ao Perplexity, Cloudflare ou Firebase nesta versão.
As conexões presentes no Computer não se tornam credenciais públicas do aplicativo.
O crédito de API informado pelo usuário não foi consultado nem consumido.

Para dados reais, autenticação profissional ou conexão a sistemas assistenciais, exige-se
projeto separado de segurança, privacidade, base legal, segregação, retenção, auditoria,
validação clínica e revisão regulatória. Pseudônimo não é anonimização.

## Desenvolvimento

Sem build ou dependências. Servir o diretório `saude/` com servidor HTTP estático.
Fontes Newsreader e Plus Jakarta Sans são cópias dos assets licenciados do Hub, com licenças OFL incluídas.
Executar `node tests/saude.test.cjs` da raiz do Hub e `npm test` no diretório canônico EVAM.
