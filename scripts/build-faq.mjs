#!/usr/bin/env node
/**
 * Gera `faq/index.html` e `data/faq.seed.sql` a partir de `data/faq.json`.
 *
 * O corpus é a fonte de registro; a página e o banco são derivados dele
 * (ADR 0001, invariante 1: separar a fonte da ferramenta). Rodar após
 * qualquer edição em `data/faq.json`:
 *
 *     node scripts/build-faq.mjs
 *
 * Sem dependências externas e sem etapa de build no deploy: o GitHub Pages
 * publica o HTML já gerado e versionado.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const corpus = JSON.parse(readFileSync(join(root, "data/faq.json"), "utf8"));

const SITE = "https://iniciativa-via.com/via-hub/";
const PAGE = `${SITE}faq/`;
const TITLE = "Perguntas frequentes — Iniciativa VIA | Dr Lucas HR Almeida";
const DESCRIPTION =
  "FAQ canônico da Iniciativa VIA — Vida Integrada e Autônoma: identidade, método, limites declarados, uso de IA em saúde, projetos publicados e política de citação. Respostas verificáveis de Dr Lucas HR Almeida (FMRP-USP).";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const labelOf = (id) => corpus.categories.find((c) => c.id === id)?.label ?? id;

/* ---------------------------------------------------------------- JSON-LD */

const faqPage = {
  "@type": "FAQPage",
  "@id": `${PAGE}#faqpage`,
  url: PAGE,
  name: "Perguntas frequentes — Iniciativa VIA",
  headline: "Perguntas frequentes sobre a Iniciativa VIA e Dr Lucas HR Almeida",
  description: DESCRIPTION,
  inLanguage: "pt-BR",
  isPartOf: { "@id": `${SITE}#website` },
  about: { "@id": `${SITE}#organization` },
  author: { "@id": `${SITE}#lucas-hr-almeida` },
  publisher: { "@id": `${SITE}#organization` },
  isAccessibleForFree: true,
  dateModified: corpus.version,
  mainEntity: corpus.faqs.map((f) => ({
    "@type": "Question",
    "@id": `${PAGE}#${f.id}`,
    name: f.question,
    answerCount: 1,
    acceptedAnswer: { "@type": "Answer", text: f.answer, url: `${PAGE}#${f.id}` },
  })),
};

const breadcrumb = {
  "@type": "BreadcrumbList",
  "@id": `${PAGE}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: SITE },
    { "@type": "ListItem", position: 2, name: "Perguntas frequentes", item: PAGE },
  ],
};

// Nós reaproveitados do grafo já publicado nas demais páginas do site.
const sharedGraph = JSON.parse(readFileSync(join(root, "data/graph-nodes.json"), "utf8"));

const jsonLd = JSON.stringify(
  { "@context": "https://schema.org", "@graph": [faqPage, breadcrumb, ...sharedGraph] },
  null,
  2,
);

/* ------------------------------------------------------------------- HTML */

const groups = corpus.categories
  .map((cat) => {
    const items = corpus.faqs.filter((f) => f.category === cat.id);
    if (items.length === 0) return "";
    const articles = items
      .map((f) => {
        const link = f.link
          ? `\n            <p class="faq-link"><a href="${escapeHtml(f.link.href)}"${
              f.link.external ? ' target="_blank" rel="noopener noreferrer"' : ""
            }>${escapeHtml(f.link.label)}${f.link.external ? " ↗" : " →"}</a></p>`
          : "";
        return `          <article class="faq-item" id="${escapeHtml(f.id)}" data-category="${escapeHtml(f.category)}">
            <h3 data-question>${escapeHtml(f.question)}</h3>
            <p class="faq-answer" data-answer>${escapeHtml(f.answer)}</p>${link}
            <a class="faq-anchor" href="#${escapeHtml(f.id)}" aria-label="Link direto para: ${escapeHtml(f.question)}">#</a>
          </article>`;
      })
      .join("\n");
    return `        <section class="faq-group" data-group="${escapeHtml(cat.id)}" aria-labelledby="grupo-${escapeHtml(cat.id)}">
          <h2 class="faq-group-title" id="grupo-${escapeHtml(cat.id)}">${escapeHtml(cat.label)}</h2>
${articles}
        </section>`;
  })
  .filter(Boolean)
  .join("\n\n");

const filters = [
  `          <button type="button" class="filter is-active" data-filter="all" aria-pressed="true">Tudo</button>`,
  ...corpus.categories
    .filter((c) => corpus.faqs.some((f) => f.category === c.id))
    .map(
      (c) =>
        `          <button type="button" class="filter" data-filter="${escapeHtml(c.id)}" aria-pressed="false">${escapeHtml(c.label)}</button>`,
    ),
].join("\n");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(TITLE)}</title>
  <link rel="author" href="${SITE}humans.txt">
  <!-- via-seo -->
  <meta name="author" content="Dr Lucas HR — Iniciativa VIA">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${PAGE}">
  <meta name="description" content="${escapeHtml(DESCRIPTION)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Iniciativa VIA">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="Perguntas frequentes — Iniciativa VIA">
  <meta property="og:description" content="${escapeHtml(DESCRIPTION)}">
  <meta property="og:url" content="${PAGE}">
  <meta property="og:image" content="${SITE}assets/og-via.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Perguntas frequentes — Iniciativa VIA">
  <meta name="twitter:description" content="${escapeHtml(DESCRIPTION)}">
  <meta name="twitter:image" content="${SITE}assets/og-via.png">
  <meta name="theme-color" content="#0C3E67">
  <script type="application/ld+json">
${jsonLd}
  </script>
  <style>
    :root{
      --navy-950:#062a47;--navy-900:#0c3e67;--navy-800:#12527f;--navy-700:#196793;
      --teal-500:#19a6c9;--green-500:#2eaf53;--green-600:#218c42;
      --ink:#122331;--muted:#526879;--line:#d7e1e8;--line-strong:#b8c8d3;
      --paper:#fff;--wash:#f3f7f9;--wash-blue:#edf5f8;
      --radius-md:18px;--radius-sm:10px;--shell:1080px;--header-h:72px;
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth;scroll-padding-top:calc(var(--header-h) + 20px)}
    body{margin:0;background:var(--paper);color:var(--ink);
      font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    a{color:inherit}
    img{max-width:100%;height:auto}
    .shell{width:min(calc(100% - 48px),var(--shell));margin-inline:auto}
    .section{padding:88px 0}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .skip-link{position:fixed;z-index:999;top:12px;left:12px;padding:10px 14px;border-radius:8px;background:var(--paper);color:var(--navy-900);font-weight:700;text-decoration:none;transform:translateY(-140%);transition:transform .2s}
    .skip-link:focus{transform:translateY(0)}
    :focus-visible{outline:3px solid rgba(25,166,201,.55);outline-offset:3px}
    /* header */
    .site-header{position:fixed;z-index:100;inset:0 0 auto;height:var(--header-h);color:var(--paper);transition:background .25s,box-shadow .25s,color .25s}
    .site-header.is-scrolled{background:rgba(255,255,255,.96);color:var(--navy-950);box-shadow:0 1px 0 rgba(12,62,103,.1),0 10px 32px rgba(6,42,71,.08);backdrop-filter:blur(18px)}
    .header-inner{height:100%;display:flex;align-items:center;gap:20px}
    .brand{display:inline-flex;align-items:center;gap:12px;min-width:max-content;color:inherit;text-decoration:none}
    .brand-mark{position:relative;display:grid;place-items:center;width:42px;height:42px;border:1px solid currentColor;border-radius:12px 4px 12px 4px;overflow:hidden}
    .brand-mark::before,.brand-mark::after{content:"";position:absolute;background:currentColor;opacity:.24}
    .brand-mark::before{width:1px;height:150%;transform:rotate(35deg)}
    .brand-mark::after{width:150%;height:1px;transform:rotate(-20deg)}
    .brand-mark span{position:relative;z-index:1;font-size:19px;font-weight:800;letter-spacing:-.08em}
    .brand-copy{display:flex;flex-direction:column;line-height:1.05}
    .brand-copy strong{font-size:16px;letter-spacing:.18em}
    .brand-copy small{margin-top:5px;font-size:10px;font-weight:600;letter-spacing:.055em;opacity:.72}
    .header-nav{display:flex;align-items:center;gap:22px;margin-left:auto}
    .header-nav a{color:inherit;text-decoration:none;font-size:12.5px;font-weight:700;position:relative}
    .header-nav a::after{content:"";position:absolute;inset:auto 0 -7px;height:2px;background:var(--teal-500);transform:scaleX(0);transform-origin:left;transition:transform .18s}
    .header-nav a:hover::after{transform:scaleX(1)}
    .header-nav .cta{padding:9px 15px;border:1px solid currentColor;border-radius:999px}
    .header-nav .cta::after{display:none}
    .header-nav .cta:hover{color:var(--navy-950);background:var(--paper);border-color:var(--paper)}
    .site-header.is-scrolled .header-nav .cta:hover{color:var(--paper);background:var(--navy-900);border-color:var(--navy-900)}
    /* hero */
    .hero{position:relative;padding:132px 0 64px;overflow:hidden;color:var(--paper);
      background:radial-gradient(circle at 86% 16%,rgba(25,166,201,.34),transparent 32%),radial-gradient(circle at 62% 94%,rgba(46,175,83,.16),transparent 34%),linear-gradient(135deg,var(--navy-950) 0%,var(--navy-900) 58%,#0b496e 100%)}
    .hero-grid{position:absolute;inset:0;opacity:.12;background-image:linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px);background-size:72px 72px;-webkit-mask-image:linear-gradient(to right,transparent 2%,#000 45%,#000 100%)}
    .hero-inner{position:relative}
    .eyebrow{margin:0 0 18px;font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;display:inline-flex;align-items:center;gap:10px;color:#c9edf5}
    .eyebrow span{width:26px;height:2px;background:var(--green-500)}
    .hero h1{margin:0;font-size:clamp(2.4rem,5vw,3.9rem);font-weight:760;letter-spacing:-.05em;line-height:1.02}
    .hero h1 em{display:block;color:#c8edf4;font-family:Georgia,"Times New Roman",serif;font-style:normal;font-weight:400;letter-spacing:-.03em}
    .hero-lede{max-width:620px;margin:22px 0 0;color:rgba(255,255,255,.8);font-size:17.5px;line-height:1.68}
    /* busca */
    .faq-search{margin:34px 0 0;max-width:620px}
    .faq-search label{display:block;margin-bottom:9px;font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#c9edf5}
    .faq-search-field{display:flex;gap:10px;flex-wrap:wrap}
    .faq-search input{flex:1 1 260px;min-height:50px;padding:12px 18px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(255,255,255,.1);color:var(--paper);font:inherit;font-size:15px}
    .faq-search input::placeholder{color:rgba(255,255,255,.55)}
    .faq-search input:focus{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.6);outline:none}
    .faq-search input:focus-visible{outline:3px solid rgba(25,166,201,.55);outline-offset:2px}
    .faq-search .clear{min-height:50px;padding:12px 20px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:transparent;color:var(--paper);font:inherit;font-size:13px;font-weight:800;cursor:pointer;transition:background .16s,border-color .16s}
    .faq-search .clear:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.5)}
    .faq-hint{margin:12px 0 0;color:rgba(255,255,255,.55);font-size:12.5px}
    .faq-hint kbd{padding:2px 7px;border:1px solid rgba(255,255,255,.3);border-radius:5px;font-family:inherit;font-size:11px;font-weight:700}
    /* corpo */
    .faq-body{padding-top:56px}
    .faq-filters{display:flex;flex-wrap:wrap;gap:8px;padding-bottom:24px;margin-bottom:20px;border-bottom:1px solid var(--line)}
    .filter{padding:8px 13px;border:1px solid var(--line);border-radius:999px;background:var(--paper);color:var(--muted);font:inherit;font-size:11px;font-weight:750;cursor:pointer;transition:color .16s,border-color .16s,background .16s}
    .filter:hover,.filter.is-active{color:var(--paper);border-color:var(--navy-900);background:var(--navy-900)}
    .faq-status{margin:0 0 30px;color:var(--muted);font-size:13px;font-weight:650}
    .faq-group{margin:0 0 52px}
    .faq-group[hidden]{display:none}
    .faq-group-title{margin:0 0 22px;padding-bottom:12px;border-bottom:1px solid var(--line);color:var(--navy-950);font-size:13px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
    .faq-item{position:relative;padding:26px 30px;margin-bottom:14px;border:1px solid var(--line);border-left:3px solid var(--teal-500);border-radius:var(--radius-sm);background:var(--paper);transition:transform .2s,box-shadow .2s}
    .faq-item:hover{transform:translateY(-2px);box-shadow:0 16px 38px rgba(6,42,71,.08)}
    .faq-item[hidden]{display:none}
    .faq-item:target{border-left-color:var(--green-500);background:var(--wash-blue)}
    .faq-item h3{margin:0 0 10px;color:var(--navy-950);font-size:19px;letter-spacing:-.025em;line-height:1.35;padding-right:24px}
    .faq-answer{margin:0;color:var(--muted);font-size:15.5px;line-height:1.7}
    .faq-link{margin:14px 0 0}
    .faq-link a{color:var(--navy-800);font-size:13px;font-weight:800;text-decoration:none}
    .faq-link a:hover{text-decoration:underline;text-underline-offset:3px}
    .faq-anchor{position:absolute;top:26px;right:22px;color:var(--line-strong);font-size:15px;font-weight:800;text-decoration:none;opacity:0;transition:opacity .16s}
    .faq-item:hover .faq-anchor,.faq-anchor:focus-visible{opacity:1}
    .faq-anchor:hover{color:var(--teal-500)}
    mark{background:#ffeaa0;color:var(--ink);padding:0 2px;border-radius:3px}
    .faq-empty{padding:40px 28px;border:1px dashed var(--line-strong);border-radius:var(--radius-md);color:var(--muted);text-align:center}
    .faq-empty[hidden]{display:none}
    /* autoria */
    .author-band{background:var(--wash);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:56px 0}
    .author-card{display:flex;flex-wrap:wrap;align-items:center;gap:26px}
    .author-card img{width:96px;height:96px;border-radius:6px 26px 6px 26px;object-fit:cover;border:1px solid var(--line-strong)}
    .author-copy{flex:1 1 320px}
    .author-copy p{margin:0 0 6px}
    .author-kicker{color:var(--teal-500);font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}
    .author-name{color:var(--navy-950);font-size:21px;font-weight:750;letter-spacing:-.03em}
    .author-meta{color:var(--muted);font-size:14px}
    .button{display:inline-flex;align-items:center;gap:9px;min-height:48px;padding:12px 20px;border:1px solid transparent;border-radius:999px;text-decoration:none;font-size:13px;font-weight:800;white-space:nowrap;transition:transform .18s,box-shadow .18s,background .18s}
    .button:hover{transform:translateY(-2px)}
    .button-dark{color:var(--paper);background:var(--navy-900)}
    .button-ghost{color:var(--navy-900);border:1px solid var(--line-strong);background:var(--paper)}
    .button-ghost:hover{border-color:var(--navy-700)}
    .cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
    /* footer */
    .site-footer{padding:56px 0 26px;color:rgba(255,255,255,.72);background:#051f34;text-align:center;line-height:1.75;font-size:13px}
    .site-footer .brand{justify-content:center;margin-bottom:16px;color:var(--paper);display:inline-flex}
    .site-footer p{margin:0 0 4px}
    .site-footer strong{color:#fff}
    .site-footer a{color:#9edce8;text-decoration:none;font-weight:700}
    .site-footer a:hover{text-decoration:underline;text-underline-offset:3px}
    .site-footer .base{margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.4);font-size:10px;letter-spacing:.05em;text-transform:uppercase}
    @media (max-width:900px){
      .header-nav a:not(.cta){display:none}
      .section{padding:64px 0}
      .faq-body{padding-top:44px}
    }
    @media (max-width:620px){
      .shell{width:min(calc(100% - 32px),var(--shell))}
      .brand-copy small{display:none}
      .faq-item{padding:22px}
      .faq-anchor{display:none}
    }
    @media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition-duration:.01ms!important}}
  </style>
</head>
<body>
  <a class="skip-link" href="#conteudo">Ir para o conteúdo</a>

  <header class="site-header" data-header>
    <div class="shell header-inner">
      <a class="brand" href="../" aria-label="Iniciativa VIA — início">
        <span class="brand-mark" aria-hidden="true"><span>V</span></span>
        <span class="brand-copy"><strong>VIA</strong><small>Vida Integrada e Autônoma</small></span>
      </a>
      <nav class="header-nav" aria-label="Navegação da página">
        <a href="../sobre/">Sobre o fundador</a>
        <a href="../#portfolio">Portfólio</a>
        <a class="cta" href="../">Explorar o hub</a>
      </nav>
    </div>
  </header>

  <main id="conteudo">
    <section class="hero">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="shell hero-inner">
        <p class="eyebrow"><span></span> FAQ canônico · Iniciativa VIA</p>
        <h1>Perguntas<em>frequentes</em></h1>
        <p class="hero-lede">Respostas curtas e citáveis sobre a iniciativa, o método, os limites declarados e os projetos publicados. Cada resposta deriva de uma fonte versionada neste repositório — a busca abaixo roda inteiramente no seu navegador, sem enviar o que você digita a servidor algum.</p>

        <form class="faq-search" role="search" data-search novalidate>
          <label for="faq-q">Buscar nas perguntas</label>
          <div class="faq-search-field">
            <input type="search" id="faq-q" name="q" placeholder="ex: dados, saúde, mentoria, citar…" autocomplete="off" data-input>
            <button type="button" class="clear" data-clear>Limpar</button>
          </div>
          <p class="faq-hint">Pressione <kbd>/</kbd> para buscar e <kbd>Esc</kbd> para limpar.</p>
        </form>
      </div>
    </section>

    <section class="section faq-body">
      <div class="shell">
        <div class="faq-filters" role="group" aria-label="Filtrar perguntas por tema" data-filters>
${filters}
        </div>

        <p class="faq-status" role="status" aria-live="polite" data-status>${corpus.faqs.length} perguntas.</p>

        <div data-results>
${groups}
        </div>

        <p class="faq-empty" hidden data-empty>Nenhuma pergunta corresponde à busca. Tente outro termo ou volte para <button type="button" class="filter" data-clear>todas as perguntas</button>.</p>
      </div>
    </section>

    <section class="author-band">
      <div class="shell author-card">
        <img src="../assets/dr-lucas-hr.jpg" width="900" height="1200" alt="Retrato de Dr Lucas HR Almeida" loading="lazy" decoding="async">
        <div class="author-copy">
          <p class="author-kicker">Quem responde</p>
          <p class="author-name">Dr Lucas HR Almeida</p>
          <p class="author-meta">Médico generalista (FMRP-USP) · CRM-SP 226836 | CRM-MG 109752 · Fundador da Iniciativa VIA</p>
          <div class="cta-row">
            <a class="button button-dark" href="../sobre/">Página do fundador <span aria-hidden="true">→</span></a>
            <a class="button button-ghost" href="https://github.com/LucasHRAlmeida/via-hub/issues/new?template=parceria.yml" target="_blank" rel="noopener noreferrer">Propor parceria <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell">
      <div class="brand"><span class="brand-mark" aria-hidden="true"><span>V</span></span><span class="brand-copy"><strong>VIA</strong><small>Vida Integrada e Autônoma</small></span></div>
      <p><strong>Dr Lucas HR Almeida</strong> — Médico Generalista (FMRP-USP) · CRM-SP 226836 | CRM-MG 109752</p>
      <p>Ciência e Tecnologia a serviço do Cuidado.</p>
      <p><a href="../">Iniciativa VIA</a> · <a href="../sobre/">Sobre o fundador</a> · <a href="../llms.txt">Mapa de conteúdo</a> · <a href="../ai.txt">Política para agentes de IA</a></p>
      <p class="base">Conteúdo educativo — não substitui avaliação, diagnóstico ou tratamento profissional.</p>
    </div>
  </footer>

  <script src="faq.js" defer></script>
</body>
</html>
`;

/* -------------------------------------------------------------- seed D1 */

const sqlString = (s) => `'${String(s).replace(/'/g, "''")}'`;
const seed = `-- Gerado por scripts/build-faq.mjs a partir de data/faq.json — não editar à mão.
-- Alinha o banco D1 (via-hub-lab) ao corpus publicado em /faq/, de modo que o
-- Worker via-hub-search responda exatamente o que a página mostra.
--
--   npx wrangler d1 execute via-hub-lab --remote --file=data/faq.seed.sql
--
-- O rebuild final do índice FTS é necessário porque o schema só tem trigger
-- AFTER INSERT: sem ele, o índice mantém as linhas antigas.

BEGIN TRANSACTION;

DELETE FROM faqs;

${corpus.faqs
  .map((f, i) =>
    `INSERT INTO faqs (id, question, answer, category) VALUES (${i + 1}, ${sqlString(f.question)}, ${sqlString(f.answer)}, ${sqlString(f.category)});`,
  )
  .join("\n")}

INSERT INTO faqs_fts(faqs_fts) VALUES('rebuild');

COMMIT;
`;

mkdirSync(join(root, "faq"), { recursive: true });
writeFileSync(join(root, "faq/index.html"), html);
writeFileSync(join(root, "data/faq.seed.sql"), seed);

console.log(`faq/index.html         ${corpus.faqs.length} perguntas em ${corpus.categories.length} temas`);
console.log(`data/faq.seed.sql      ${corpus.faqs.length} linhas`);
