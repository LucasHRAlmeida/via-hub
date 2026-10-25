# Saúde na Última Semana — Revista Eletrônica VIA

Revista web semanal de **saúde pública, ciência, cuidado e tecnologia** da Iniciativa VIA. Seleciona os fatos materialmente mais relevantes de cada semana, explicita o que mudou, separa decisão institucional de implementação e liga cada alegação epidemiológica, regulatória ou quantitativa à fonte primária correspondente.

## Acesso

- Página publicada: <https://iniciativa-via.com/via-hub/revista/>
## Arquivo das edições

### Especial nº 001 — PARAR

Página: `especial-2026-10-04.html`; PDF correspondente: `especial-2026-10-04.pdf`.
A diagramação ampliada tem seis páginas A4, sumário navegável e colofão assinado
por Dr Lucas HR Almeida. A revisão de 09/10/2026 aplica a avaliação editorial
fornecida pelo mantenedor: explicita o percurso praça → instituições → decisão,
define «corte», delimita as alegações sobre plataformas e substitui o monólogo
por «A pausa é de quem decide». 04/10/2026 é a referência editorial;
08/10/2026 é a publicação da edição ampliada. A versão curta anterior permanece
no histórico Git e em `arquivo/especial-2026-10-04-versao-curta.pdf`; a edição
ampliada anterior foi preservada, sem regeneração, em
`arquivo/especial-2026-10-04-revisao-2026-10-08.pdf`.

O canal de acompanhamento é [🩺 VIA - Dr Lucas HR](https://whatsapp.com/channel/0029Vb4Ped05q08h0Uc7PY3v),
exposto na navegação web e no fecho em HTML e PDF. O QR e o convite de conversa
usam `https://wa.me/message/AFWK5RO4256SG1`, link fornecido pelo mantenedor para
seu WhatsApp Business/Nexo. O canal e a conversa têm convites separados.
A autocrítica e o escopo da revisão estão em
`revisao-especial-2026-10-09.md`; autoria não equivale a revisão independente.

O QR vetorial é `assets/qr-whatsapp-business-via.svg`; sua versão PNG de divulgação
é `assets/qr-whatsapp-business-via.png`. A fonte reproduzível é
`scripts/generate-whatsapp-qr.py` (Python, `qrcode==8.2` e `fontTools`): correção de
erros H, margem de quatro módulos, módulos suavizados e marca VIA em traçados da
fonte local. O PNG é uma renderização do SVG. A decodificação deve reproduzir o
link exato, inclusive no QR renderizado da página e do PDF.

Antes da inclusão do QR, o PDF editorial de 09/10 foi preservado sem alteração em
`arquivo/especial-2026-10-04-revisao-2026-10-09-editorial.pdf`.

As fontes Cinzel, Newsreader e Plus Jakarta Sans são servidas localmente em
`assets/fonts/parar/`, com licenças SIL Open Font License. O glifo do canal usa
um subconjunto de Noto Emoji, renomeado VIA Channel Emoji, com a licença original.
O retrato é o ativo
`assets/dr-lucas-hr.jpg`; o WhatsApp e o slogan seguem os dados desta página.
O conteúdo e os metadados são HTML estático, sem JavaScript de execução.


Antes de substituir a edição corrente, exportar a versão publicada em PDF e preservá-la em `revista/arquivo/AAAA-MM-DD.pdf`. O PDF é o registro fechado da edição; `/revista/` permanece reservado ao número corrente. Não manter rotas temáticas antigas ou redirecionamentos concorrentes.

A edição candidata também acompanha o branch como `revista/edicao-AAAA-MM-DD.pdf`. Os dois PDFs devem ser A4, pesquisáveis e inspecionados visualmente antes do PR. O renderizador versionado é executado assim:

```bash
python scripts/revista/render_pdf.py revista/edicao-AAAA-MM-DD.md revista/edicao-AAAA-MM-DD.pdf
```

## Revisão editorial da edição de 25/10/2026

A revisão distribui as quatro pautas por função: reportagem principal de clima,
análise de acesso a medicamentos, alerta sanitário curto e análise de experiência
com IA. As chamadas substituem a sinopse extensa; orientações práticas passam às
matérias e o fechamento é único. A pauta de antimicrobianos foi retirada desta
edição. A fonte segue em `edicao-2026-10-25.md`, com HTML regenerado pelo promotor.

O PDF desta revisão foi convertido pelo Adobe PDF Services a partir do documento
editável `edicao-2026-10-25.rtf`: três páginas A4, texto pesquisável, links e
paginação inspecionados. O RTF é uma saída diagramada da mesma fonte Markdown;
ao editar o conteúdo, atualizar também RTF, PDF e HTML. O comando genérico do
renderizador acima continua disponível, mas não reproduz a diagramação Adobe
deste arquivo. A versão anterior está preservada sem regeneração em
`arquivo/2026-10-25-pre-revisao-editorial.pdf` e no histórico Git.

A segunda revisão acrescenta as pontes entre pautas, o endereço da VIA no
cabeçalho e os caminhos de leitura, acompanhamento e contato no expediente.
Cada matéria conserva suas fontes diretas e recebe um link para sua seção no
site. O método editorial é um expediente discreto, fora do índice das pautas;
as credenciais permanecem no rodapé. As referências mais curtas preservam os
endereços originais. A primeira revisão está preservada em
`arquivo/2026-10-25-revisao-editorial-1.pdf` (SHA-256
`88e17356fa1db099ec91df02df06f361a6b8a54e3eb9b4acf128f1c0fd9b0c03`).

PDF revisado no Adobe: <https://to.adobe.com/3O70LbruFCeLi92suz1vfdTKXJvr>.

## Escopo e limitações

- Curadoria **educativa e editorial**, voltada à compreensão de fatos e decisões informadas.
- **Não é** triagem, diagnóstico nem fonte de dados epidemiológicos ao vivo. Diante de sintomas, o encaminhamento é a unidade de saúde; para números atualizados, as fontes oficiais citadas na página.
- Tema recorrente não se torna editoria fixa: só permanece quando continua materialmente relevante na semana.
- Alegações epidemiológicas, regulatórias e quantitativas devem apontar para fonte primária específica, com data e escopo.
- A voz de marca e a paleta seguem o portal VIA — a fonte científica permanece separada da ferramenta que a apresenta.
- Toda edição corrente deve expor no topo um elo de volta ao hub (`href="../"`); a revista não mantém fileira de canais no rodapé.
- O estado de revisão da edição corrente é único e pertence ao gerador: `promote.mjs` escreve a mesma frase na barra do hub e no selo do cabeçalho a cada promoção. Como a promoção publica o número antes de qualquer reabertura de fontes primárias, a frase emitida é «Edição em revisão»; afirmar verificação exige um ato editorial posterior, não o ciclo de promoção. O QA (`promote.mjs --check`) falha se os dois rótulos divergirem.
- O corpo da edição é gerado por `scripts/revista/promote.mjs` e reaproveita o quadro já existente da página — `.wrap` para a largura, `nav.index` com `.sec-card` para o índice, `article.casa` com `.casa-inner` para cada bloco editorial. O bloco de estilo do gerador fica delimitado por `/* REVISTA_AUTOMATION_STYLES:START */` e `/* REVISTA_AUTOMATION_STYLES:END */` e é reescrito a cada promoção. O QA (`promote.mjs --check`) falha se alguma classe emitida no `<main>` não tiver regra na folha de estilo da página.

## Stack

Página única em **HTML5 + CSS3 + JavaScript** (vanilla, sem dependências externas), responsiva e alinhada à paleta institucional VIA (verde-azulado-mar). O script apenas ajusta o cabeçalho ao rolar e o ano no rodapé. Basta abrir o `index.html`.

---

**Dr Lucas HR — Médico Generalista (FMRP-USP)**

CRM-SP: 226836 | CRM-MG: 109752

[WhatsApp Business: +55 35 98441-0983](https://wa.me/5535984410983)

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.
