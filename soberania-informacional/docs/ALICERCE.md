# Alicerce — Soberania cognitiva e autonomia operacional

Versão 0.1.0 · PROPOSTO · 2026-09-30

## Objetivo autorizado

Iniciar duas portas a partir do módulo de soberania informacional no repositório público via-hub, preparando continuidade por vendors chamados pelo mantenedor.

## As duas portas

- [Soberania cognitiva](../soberania-cognitiva/index.html): tese, manifesto preservado, custódia, linguagem e agência.
- [Autonomia operacional](../autonomia-operacional/index.html): contrato comum, capacidades situadas, missões, contribuições e auditoria de cálculos.

As páginas são HTML estático, com CSS local. Não coletam entradas nem executam integrações. O registro de missões é versionado; não representa um orquestrador ou um monitor já ativo.

## Fontes e custódia

- [Manifesto Institucional, cópia preservada](../soberania-cognitiva/manifesto-institucional.pdf).
- [Proveniência e hash](PROVENIENCIA-MANIFESTO.json).
- Briefing de capacidades fornecido pelo mantenedor; incorporado ao [contrato operacional](../autonomia-operacional/CONTRATO-OPERACIONAL.md) em formulação comum aos vendors.
- [Tese preexistente de soberania informacional](TESE.md), preservada.

A página da tese formula premissas de investigação e compromissos normativos. Não anuncia a realização de toda a arquitetura local-first descrita no manifesto, nem converte o corpus fechado em garantia de ausência de erro factual.

## Cálculos

O PDF e o briefing recebidos não contêm cálculo numérico. A auditoria está em estado LACUNA.
O [registro](../autonomia-operacional/calculos.json) conserva um modelo para fontes, fórmulas, unidades, premissas, recomputação e sensibilidade. Nenhum valor foi estimado para preencher a ausência.

## Continuidade entre vendors

- Funções ainda não atribuídas.
- [Missões abertas](../autonomia-operacional/missoes.json).
- [Entrada de contribuições](../autonomia-operacional/contribuicoes/README.md).
- Ao aceitar uma missão: identificar responsável, instante de aceite, TTL e próxima checagem.
- TTL de referência: 3600 segundos após aceite, ajustável ao trabalho. Registrar o mecanismo de agendamento apenas quando realmente criado.
- Instância que não puder continuar deve devolver o registro atualizado da obrigação, incluindo a evidência já produzida.

## Critérios de conclusão desta etapa

1. As duas páginas existem e são alcançáveis a partir do módulo.
2. A fonte PDF preserva o hash recebido.
3. Os JSONs são válidos e o modelo atende ao schema.
4. Rotas, sitemap e verificações existentes do repositório passam.
5. Branch e PR permitem revisão e contribuição por outros vendors.

## Publicação

URLs previstas:
- https://iniciativa-via.com/via-hub/soberania-informacional/soberania-cognitiva/
- https://iniciativa-via.com/via-hub/soberania-informacional/autonomia-operacional/

O deploy depende do merge autorizado e da publicação existente do repositório.
[AGENTS.md](../../AGENTS.md) e [CONTRIBUTING.md](../../CONTRIBUTING.md) reservam a decisão de merge ao mantenedor e permitem sua execução pelo agente sob ordem humana expressa, vigente e pertinente à mudança. O executor registra a ordem e consolida a verificação, sem exigir despachos repetidos do mantenedor.
Após o merge, o responsável por VIA-SOB-004 verifica publicação, resposta das rotas e acesso a partir do módulo; um commit não basta como prova de deploy.
