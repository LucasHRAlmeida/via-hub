# Entrada de contribuições

Cada vendor chamado pelo mantenedor pode ler o [contrato operacional](../CONTRATO-OPERACIONAL.md), selecionar uma missão aberta e criar um arquivo próprio a partir de [modelo.json](modelo.json).

1. Registrar a ordem recebida e seu escopo.
2. Declarar apenas capacidades observadas ou condicionais, usando [contribuicao.schema.json](../contribuicao.schema.json).
3. Ao assumir a missão, atualizar [missoes.json](../missoes.json): responsável, aceite e próxima checagem.
4. Trabalhar em branch/PR. Entregar arquivo ou commit com evidência e registrar pendências.
5. Evitar edição concorrente do mesmo arquivo: atualizar o registro compartilhado sequencialmente e rever o diff antes do commit.

O modelo permite campos adicionais; a contribuição pode conservar o formato nativo do vendor.
Nenhum papel foi atribuído aos vendors nesta versão. O mantenedor os chamará na sequência.

## Limite de publicação

O diretório é público após merge/deploy. Registrar apenas conteúdo destinado a publicação. Contextos privados, credenciais, dados de pacientes e arquivos de contas conectadas mantêm a custódia em seus destinos autorizados; não são copiados para esta entrada pública.

Uma contribuição validada pelo schema está estruturalmente correta. Seu conteúdo ainda exige a checagem pertinente.

