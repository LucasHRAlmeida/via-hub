#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const checkOnly = args.includes('--check');
const edition = getArg('--edition');
if (!edition || !/^\d{4}-\d{2}-\d{2}$/.test(edition)) {
  console.error('Uso: node scripts/revista/promote.mjs --edition YYYY-MM-DD [--check]');
  process.exit(2);
}

const root = process.cwd();
const sourcePath = path.join(root, 'revista', `edicao-${edition}.md`);
const indexPath = path.join(root, 'revista', 'index.html');
if (!fs.existsSync(sourcePath)) throw new Error(`Fonte ausente: ${sourcePath}`);
if (!fs.existsSync(indexPath)) throw new Error(`Index ausente: ${indexPath}`);

const md = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
let html = fs.readFileSync(indexPath, 'utf8');

const escapeHtml = (s) => s
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function inline(text) {
  const links = [];
  let s = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label, url) => {
    const token = `\u0000LINK${links.length}\u0000`;
    links.push(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
    return token;
  });
  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(?<!["'=])(https?:\/\/[^\s<]+)/g, (raw) => {
    const m = raw.match(/^(.*?)([.,;:!?]+)?$/);
    const url = m?.[1] ?? raw;
    const tail = m?.[2] ?? '';
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${tail}`;
  });
  s = s.replace(/\u0000LINK(\d+)\u0000/g, (_, i) => links[Number(i)]);
  return s;
}

function slugify(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'secao';
}

function renderBody(body) {
  const lines = body.split('\n');
  const out = [];
  let para = [];
  let list = [];
  const flushPara = () => {
    if (!para.length) return;
    const raw = para.join(' ').trim();
    const klass = /^\*\*(Fonte|Fontes|Fonte primária|Fontes primárias|Fonte institucional)/i.test(raw) ? ' class="source-line"' : '';
    out.push(`<p${klass}>${inline(raw)}</p>`);
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    out.push('<ul>' + list.map((x) => `<li>${inline(x)}</li>`).join('') + '</ul>');
    list = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if (/^---+$/.test(line.trim())) { flushPara(); flushList(); continue; }
    if (line.startsWith('### ')) {
      flushPara(); flushList();
      out.push(`<h3>${inline(line.slice(4).trim())}</h3>`);
      continue;
    }
    if (line.startsWith('> ')) {
      flushPara(); flushList();
      out.push(`<blockquote>${inline(line.slice(2).trim())}</blockquote>`);
      continue;
    }
    if (/^-\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^-\s+/, '').trim());
      continue;
    }
    if (list.length) flushList();
    para.push(line.replace(/\s{2,}$/g, ''));
  }
  flushPara(); flushList();
  return out.join('\n');
}

const title = (md.match(/^#\s+(.+)$/m) || [,'Saúde na Última Semana — Revista Eletrônica VIA'])[1].trim();
const boldLines = [...md.matchAll(/^\*\*([^\n*]+)\*\*\s*$/gm)].map((m) => m[1].trim());
const editionHuman = boldLines.find((x) => /^Edição de /i.test(x)) || `Edição de ${edition}`;
const weekHuman = boldLines.find((x) => /^Semana de /i.test(x)) || '';
const curation = boldLines.find((x) => /Curadoria/i.test(x)) || 'Curadoria médico-científica · saúde pública, cuidado, ciência e tecnologia';
const criterion = (md.match(/^>\s+(.+)$/m) || [,''])[1].trim();

const h2Matches = [...md.matchAll(/^##\s+(.+)$/gm)];
const sections = h2Matches.map((m, i) => {
  const start = m.index + m[0].length;
  const end = i + 1 < h2Matches.length ? h2Matches[i + 1].index : md.length;
  return { heading: m[1].trim(), body: md.slice(start, end).trim() };
});
if (!sections.length) throw new Error('Nenhuma seção ## encontrada na fonte editorial.');
const summary = sections[0].heading.toLowerCase().includes('90 segundos') ? sections.shift() : null;
const cleanHeading = (heading) => heading.replace(/^\d+\.\s*/, '').trim();
const editorialSectionPattern = /^(ações práticas(?: desta semana)?|o que a via leva desta semana|método editorial)$/i;

// As manchetes editoriais usam travessão entre tema e título ("Prescrição — O digital…").
// O cartão de índice separa os dois; o texto permanece exatamente o da fonte.
const splitHeading = (clean) => {
  const i = clean.indexOf(' — ');
  if (i < 0) return { theme: '', title: clean };
  return { theme: clean.slice(0, i).trim(), title: clean.slice(i + 3).trim() };
};

const toc = sections.map((s, i) => {
  const clean = cleanHeading(s.heading);
  const { theme, title } = splitHeading(clean);
  const id = slugify(clean);
  const num = String(i + 1).padStart(2, '0');
  const kicker = theme ? `${num} · ${theme}` : num;
  return `      <a class="sec-card" href="#${id}">
        <span class="num mono">${escapeHtml(kicker)}</span>
        <h3>${escapeHtml(title)}</h3>
      </a>`;
}).join('\n');

const topicNames = sections
  .filter((s) => !editorialSectionPattern.test(cleanHeading(s.heading)))
  .slice(0, 8)
  .map((s) => cleanHeading(s.heading).replace(/:.*/, '').trim())
  .filter(Boolean);
const aboutJson = topicNames.map((name) => `          {\n            "@type": "MedicalEntity",\n            "name": ${JSON.stringify(name)}\n          }`).join(',\n');

const sectionHtml = sections.map((s, i) => {
  const clean = cleanHeading(s.heading);
  const { theme } = splitHeading(clean);
  const id = slugify(clean);
  const num = String(i + 1).padStart(2, '0');
  const kicker = theme ? `${num} · ${theme}` : `${num} · Nesta edição`;
  return `  <article class="casa" id="${id}" aria-labelledby="${id}-titulo">
    <div class="casa-inner">
      <span class="section-kicker mono">${escapeHtml(kicker)}</span>
      <h2 id="${id}-titulo">${escapeHtml(clean)}</h2>
      <div class="article-prose">
${renderBody(s.body)}
      </div>
    </div>
  </article>`;
}).join('\n');

const datePt = (() => {
  const [y,m,d] = edition.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(new Date(Date.UTC(y,m-1,d)));
})();
const editionId = edition.split('-').reverse().join('.');
const summaryHtml = summary
  ? `    <div class="edition-summary article-prose">\n${renderBody(summary.body)}\n    </div>\n`
  : '';

// O corpo entra no mesmo quadro do cabeçalho e da entrada do site: .wrap define a largura,
// nav.index + .sec-card o índice, article.casa + .casa-inner cada bloco editorial.
const main = `<main id="conteudo">
<div class="wrap">
  <section class="panorama" aria-labelledby="panorama-titulo">
    <!-- PANORAMA:START (bloco gerado automaticamente — não remova os marcadores) -->
    <div class="panorama-head" data-updated="${edition}">
      <div>
        <span class="section-kicker mono">Em 90 segundos</span>
        <h2 id="panorama-titulo">O que mudou na saúde nesta semana</h2>
      </div>
      <span class="update-pill mono">Atualizado em ${datePt}</span>
    </div>
    <div class="issue-bar mono">
      <span>Edição ${editionId} · Ano I</span>
      <span>Fonte editorial versionada em Markdown</span>
    </div>
${summaryHtml}    <nav class="index toc" aria-label="Nesta edição">
${toc}
    </nav>
    <p class="panorama-disclaimer">Revista editorial de utilidade pública, compilada de fontes oficiais e literatura científica na data acima. Confira a fonte primária antes de agir ou compartilhar.</p>
    <!-- PANORAMA:END -->
  </section>
${sectionHtml}
</div>
</main>`;

// Complementa a folha de estilo da página sem duplicá-la: .wrap, nav.index, .sec-card,
// article.casa e .casa-inner já existem e definem largura, ritmo e tipografia da edição.
// Aqui ficam só as peças que o gerador introduz, escritas com as variáveis do próprio tema.
const automationCss = `    .panorama{padding:26px 0 10px}
    .panorama-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:10px 24px}
    .panorama-head h2{font-family:Georgia,"Times New Roman",serif;font-size:clamp(24px,2.9vw,32px);font-weight:500;line-height:1.14;color:var(--navy);margin:6px 0 0}
    .section-kicker{display:block;font-size:10px;color:var(--teal-text);font-weight:500}
    .update-pill{font-size:10px;color:var(--ink2)}
    .issue-bar{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;margin-top:16px;padding-top:10px;border-top:2px solid var(--navy);font-size:10px;color:var(--ink2)}
    .edition-summary{margin-top:20px}
    .toc .num{display:block;font-size:10px;color:var(--teal-text)}
    .panorama-disclaimer{max-width:860px;font-size:12px;color:var(--ink2);margin:0 0 6px}
    article.casa .section-kicker{margin-bottom:2px}
    article.casa h2{margin-top:4px}
    .article-prose{max-width:860px;color:var(--ink)}
    .article-prose p{margin:0 0 12px;font-size:16px}
    .article-prose h3{margin:22px 0 8px;font-size:12px;color:var(--navy)}
    .article-prose ul{margin:0 0 16px;padding-left:1.2rem}
    .article-prose li{margin:8px 0;font-size:16px}
    .article-prose blockquote{margin:16px 0;padding:12px 14px;background:var(--wash);border-left:3px solid var(--navy);font-size:15px}
    .article-prose a{color:var(--teal-text);overflow-wrap:anywhere}
    .article-prose .source-line{margin-top:18px;padding-top:14px;border-top:1px solid var(--rule);font-size:13.5px;color:var(--ink2)}
    @media (max-width:860px){.panorama-head{align-items:flex-start}}
    @media print{.panorama{padding:14px 0 6px}.article-prose p,.article-prose li{font-size:10.5pt}.article-prose h3{break-after:avoid}.article-prose .source-line{font-size:9pt}.panorama-disclaimer{font-size:8.5pt}}
`;

const CSS_BEGIN = '/* REVISTA_AUTOMATION_STYLES:START */';
const CSS_END = '/* REVISTA_AUTOMATION_STYLES:END */';
const cssBlock = `\n    ${CSS_BEGIN}\n${automationCss}    ${CSS_END}\n`;

// A promoção publica o número antes de qualquer reabertura de fontes primárias,
// então este é o único estado que o gerador pode afirmar. A barra do hub e o
// selo do cabeçalho saem daqui para não divergirem entre si nem entre edições.
const STATUS_LABEL = 'Edição em revisão';
const STATUS_PATTERN = 'Edição (?:verificada|em revisão)';

// Toda classe emitida pelo gerador precisa existir na folha de estilo da página.
// Sem esta checagem o corpo volta a sair sem o quadro, como HTML válido e sem forma.
function assertStyledMarkup(doc) {
  const style = (doc.match(/<style>([\s\S]*?)<\/style>/) || [,''])[1];
  const body = (doc.match(/<main id="conteudo">[\s\S]*?<\/main>/) || [''])[0];
  const used = new Set();
  for (const m of body.matchAll(/\sclass="([^"]+)"/g)) {
    for (const name of m[1].trim().split(/\s+/)) used.add(name);
  }
  const orphans = [...used].filter((name) => !new RegExp(`\\.${name}(?![\\w-])`).test(style));
  if (orphans.length) throw new Error(`QA falhou: classes sem estilo na página: ${orphans.join(', ')}`);
}

function assertCurrent(doc) {
  const checks = [
    [`dateModified ${edition}`, new RegExp(`"dateModified"\\s*:\\s*"${edition}"`).test(doc)],
    [`lastReviewed ${edition}`, new RegExp(`"lastReviewed"\\s*:\\s*"${edition}"`).test(doc)],
    [`hero ${editionHuman}`, doc.includes(editionHuman)],
    ['PANORAMA markers', doc.includes('PANORAMA:START') && doc.includes('PANORAMA:END')],
    ['main content', doc.includes('<main id="conteudo">') && doc.includes('</main>')],
    ['marcadores de estilo', doc.includes(CSS_BEGIN) && doc.includes(CSS_END)],
    [`barra do hub com "${STATUS_LABEL}" em ${editionId}`, doc.includes(`${STATUS_LABEL} · fontes primárias · ${editionId}`)],
    [`selo do cabeçalho com "${STATUS_LABEL}"`, doc.includes(`<span class="tag n">${STATUS_LABEL}</span>`)],
    ['status sem rótulo divergente', [...doc.matchAll(new RegExp(STATUS_PATTERN, 'g'))].every((m) => m[0] === STATUS_LABEL)],
  ];
  const failed = checks.filter(([,ok]) => !ok).map(([name]) => name);
  if (failed.length) throw new Error(`QA falhou: ${failed.join('; ')}`);
  assertStyledMarkup(doc);
  if (!fs.existsSync(sourcePath)) throw new Error('QA falhou: fonte Markdown ausente.');
}

if (checkOnly) {
  assertCurrent(html);
  console.log(`QA Revista OK: ${edition}`);
  process.exit(0);
}

if (!/<main id="conteudo">[\s\S]*?<\/main>/.test(html)) throw new Error('Não foi possível localizar <main id="conteudo"> no index.html.');
html = html.replace(/<main id="conteudo">[\s\S]*?<\/main>/, main.trimStart());
const conciseDescription = criterion || 'Síntese semanal de saúde pública, cuidado, ciência e tecnologia, com fontes primárias e limites de evidência.';
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>Saúde na Última Semana — ${editionId} · Revista Eletrônica VIA</title>`);
html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(conciseDescription)}">`);
html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="Saúde na Última Semana — ${editionId} · VIA">`);
html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(conciseDescription)}">`);
html = html.replace(/("description"\s*:\s*)"[^"]*"/, `$1${JSON.stringify(conciseDescription)}`);
html = html.replace(new RegExp(`${STATUS_PATTERN} · fontes primárias · \\d{2}\\.\\d{2}\\.\\d{4}`), `${STATUS_LABEL} · fontes primárias · ${editionId}`);
html = html.replace(new RegExp(`(<span class="tag n">)${STATUS_PATTERN}(</span>)`), `$1${STATUS_LABEL}$2`);
html = html.replace(/<h2>[^<]*<\/h2>\s*<p>[^<]*<\/p>\s*<\/div>\s*<div class="meta mono">\s*<span><b>Edição de [^<]*<\/b><\/span>\s*<span><b>Semana<\/b>[^<]*<\/span>/,
  `<h2>${escapeHtml(cleanHeading(sections[0]?.heading || 'Edição semanal'))}</h2>\n      <p>${inline(criterion)}</p>\n    </div>\n    <div class="meta mono">\n      <span><b>${escapeHtml(editionHuman)}</b></span>\n      <span><b>Semana</b> ${escapeHtml(weekHuman.replace(/^Semana de\s*/i, ''))}</span>`);
html = html.replace(/Revista Eletrônica VIA · Saúde na Última Semana · edição de \d{2}\.\d{2}\.\d{4}\./,
  `Revista Eletrônica VIA · Saúde na Última Semana · edição de ${editionId}.`);
html = html.replace(/"dateModified"\s*:\s*"\d{4}-\d{2}-\d{2}"/g, `"dateModified": "${edition}"`);
html = html.replace(/"lastReviewed"\s*:\s*"\d{4}-\d{2}-\d{2}"/g, `"lastReviewed": "${edition}"`);
html = html.replace(/"about"\s*:\s*\[[\s\S]*?\],\s*"specialty"/, `"about": [\n${aboutJson}\n        ],\n        "specialty"`);
html = html.replace(/[ \t]*\/\* REVISTA_AUTOMATION_STYLES \*\/[\s\S]*?(?=<\/style>)/, '');
if (html.includes(CSS_BEGIN) && html.includes(CSS_END)) {
  const region = new RegExp(`[ \\t]*${CSS_BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${CSS_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`);
  html = html.replace(region, () => cssBlock.replace(/^\n/, ''));
} else {
  html = html.replace('</style>', () => `${cssBlock}  </style>`);
}

fs.writeFileSync(indexPath, html);
assertCurrent(html);
console.log(`Revista promovida localmente: ${edition}`);
