# Saúde na Última Semana — Revista Eletrônica VIA

Revista semanal de **saúde pública, ciência, cuidado e tecnologia** da Iniciativa VIA. A página pública única é **[/revista/](https://iniciativa-via.com/via-hub/revista/)**. O HTML corrente é gerado a partir do Markdown; cada pauta liga alegações epidemiológicas, regulatórias e quantitativas à fonte oficial ou primária correspondente.

## Edição corrente — 31/10/2026

- Recorte: **24 a 30/10/2026**.
- Pautas: política de informação e saúde digital do SUS; implantação do teste DNA-HPV; atualização do surto de Bundibugyo.
- Fonte canônica: `revista/edicao-2026-10-31.md`.
- Página canônica: `revista/index.html`.
- PDF de leitura: `revista/edicao-2026-10-31.pdf` (A4, pesquisável, revisado visualmente no Adobe antes da prontidão).
- A edição permanece em revisão. O PR é candidato; merge reativa a página pública. Não houve publicação nesta execução.

## Arquivo

- Edição semanal anterior, 25/10/2026: `revista/arquivo/2026-10-25.pdf`. É o PDF final de três páginas A4 já inspecionado na revisão anterior; o mesmo blob foi preservado, sem regeneração.
- Especial nº 001 — PARAR: PDF histórico em `revista/arquivo/especial-2026-10-04.pdf`. A antiga página temática `especial-2026-10-04.html` foi removida; não há rota HTML paralela.
- Revisões anteriores da edição de 25/10 permanecem no histórico de arquivo, sem competir com o PDF fechado.

## Regra de promoção e QA

Antes de substituir uma edição, o PDF fechado da página corrente deve ser arquivado em `revista/arquivo/AAAA-MM-DD.pdf`. A edição candidata deve trazer Markdown, HTML e PDF no mesmo branch/PR. O promotor atualiza metadados, JSON-LD, índice e corpo; o QA verifica a correspondência Markdown/HTML, links e âncoras, ausência de rotas temáticas residuais e os dois PDFs (integridade, A4 e texto pesquisável).

```bash
node scripts/revista/promote.mjs --edition YYYY-MM-DD
node scripts/revista/promote.mjs --edition YYYY-MM-DD --check
```

## Escopo

- Curadoria educativa; não é triagem, diagnóstico nem fonte epidemiológica em tempo real.
- Tema recorrente só entra quando há mudança material no recorte.
- Números conservam data, território e atribuição da fonte.
- O painel de nirsevimabe foi anunciado como público, mas os links diretos não abriram no ambiente de apuração; nenhum indicador não verificado foi reproduzido.
- A pesquisa bibliográfica excluiu um ensaio de deucrictibant cuja publicação online ocorreu em 08/10, fora do recorte 24–30/10.
- A página mantém endereço estável, fontes por pauta e expediente discreto. Acompanhamento: [Canal VIA](https://whatsapp.com/channel/0029Vb4Ped05q08h0Uc7PY3v). Contato/correções: [WhatsApp Business](https://wa.me/message/AFWK5RO4256SG1).

---

**Dr Lucas HR Almeida — Médico Generalista (FMRP-USP)**

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.
