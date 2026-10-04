# Saúde na Última Semana — Revista Eletrônica VIA

Revista web semanal de **saúde pública, ciência, cuidado e tecnologia** da Iniciativa VIA. Seleciona os fatos materialmente mais relevantes de cada semana, explicita o que mudou, separa decisão institucional de implementação e liga cada alegação epidemiológica, regulatória ou quantitativa à fonte primária correspondente.

## Acesso

- Página publicada: <https://iniciativa-via.com/via-hub/revista/>
## Arquivo das edições

Antes de substituir a edição corrente, exportar a versão publicada em PDF e preservá-la em `revista/arquivo/AAAA-MM-DD.pdf`. O PDF é o registro fechado da edição; `/revista/` permanece reservado ao número corrente. Não manter rotas temáticas antigas ou redirecionamentos concorrentes.

A edição candidata também acompanha o branch como `revista/edicao-AAAA-MM-DD.pdf`. Os dois PDFs devem ser A4, pesquisáveis e inspecionados visualmente antes do PR. O renderizador versionado é executado assim:

```bash
python scripts/revista/render_pdf.py revista/edicao-AAAA-MM-DD.md revista/edicao-AAAA-MM-DD.pdf
```

## Escopo e limitações

- Curadoria **educativa e editorial**, voltada à compreensão de fatos e decisões informadas.
- **Não é** triagem, diagnóstico nem fonte de dados epidemiológicos ao vivo. Diante de sintomas, o encaminhamento é a unidade de saúde; para números atualizados, as fontes oficiais citadas na página.
- Tema recorrente não se torna editoria fixa: só permanece quando continua materialmente relevante na semana.
- Alegações epidemiológicas, regulatórias e quantitativas devem apontar para fonte primária específica, com data e escopo.
- A voz de marca e a paleta seguem o portal VIA — a fonte científica permanece separada da ferramenta que a apresenta.
- Toda edição corrente deve expor no topo um elo de volta ao hub (`href="../"`); a revista não mantém fileira de canais no rodapé.
- O corpo da edição é gerado por `scripts/revista/promote.mjs` e reaproveita o quadro já existente da página — `.wrap` para a largura, `nav.index` com `.sec-card` para o índice, `article.casa` com `.casa-inner` para cada bloco editorial. O bloco de estilo do gerador fica delimitado por `/* REVISTA_AUTOMATION_STYLES:START */` e `/* REVISTA_AUTOMATION_STYLES:END */` e é reescrito a cada promoção. O QA (`promote.mjs --check`) falha se alguma classe emitida no `<main>` não tiver regra na folha de estilo da página.

## Stack

Página única em **HTML5 + CSS3 + JavaScript** (vanilla, sem dependências externas), responsiva e alinhada à paleta institucional VIA (verde-azulado-mar). O script apenas ajusta o cabeçalho ao rolar e o ano no rodapé. Basta abrir o `index.html`.

---

**Dr Lucas HR — Médico Generalista (FMRP-USP)**

CRM-SP: 226836 | CRM-MG: 109752

[WhatsApp Business: +55 16 99618-0196](https://wa.me/5516996180196)

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.
