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

const toc = sections.map((s, i) => {
  const clean = cleanHeading(s.heading);
  const id = slugify(clean);
  const num = String(i + 1).padStart(2, '0');
  return `<li><a href="#${id}"><b>${num}</b><span>${escapeHtml(clean)}</span></a></li>`;
}).join('\n');

const topicNames = sections
  .filter((s) => !editorialSectionPattern.test(cleanHeading(s.heading)))
  .slice(0, 8)
  .map((s) => cleanHeading(s.heading).replace(/:.*/, '').trim())
  .filter(Boolean);
const aboutJson = topicNames.map((name) => `          {\n            "@type": "MedicalEntity",\n            "name": ${JSON.stringify(name)}\n          }`).join(',\n');

const sectionHtml = sections.map((s, i) => {
  const clean = cleanHeading(s.heading);
  const id = slugify(clean);
  const num = String(i + 1).padStart(2, '0');
  const cls = i % 2 === 0 ? 'focus' : 'topics';
  return `    <section class="${cls} section" id="${id}" aria-labelledby="${id}-titulo">\n      <div class="shell">\n        <div class="section-heading">\n          <p class="section-kicker">${num} · Nesta edição</p>\n          <h2 id="${id}-titulo">${escapeHtml(clean)}</h2>\n        </div>\n        <div class="article-prose">\n${renderBody(s.body)}\n        </div>\n      </div>\n    </section>`;
}).join('\n');

const datePt = (() => {
  const [y,m,d] = edition.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(new Date(Date.UTC(y,m-1,d)));
})();
const editionId = edition.split('-').reverse().join('.');
const main = `  <main id="conteudo">\n    <section class="panorama section" id="panorama" aria-labelledby="panorama-titulo">\n      <div class="shell">\n        <!-- PANORAMA:START (bloco gerado automaticamente — não remova os marcadores) -->\n        <div class="panorama-head" data-updated="${edition}">\n          <div class="section-heading">\n            <p class="section-kicker">Em 90 segundos</p>\n            <h2 id="panorama-titulo">O que mudou na saúde nesta semana</h2>\n          </div>\n          <span class="update-pill">Atualizado em ${datePt}</span>\n        </div>\n        <div class="issue-bar">\n          <span class="issue-id">Edição ${editionId} · Ano I</span>\n          <span class="issue-id">Fonte editorial versionada em Markdown</span>\n        </div>\n        ${summary ? `<div class="edition-summary article-prose">${renderBody(summary.body)}</div>` : ''}\n        <ul class="toc">${toc}</ul>\n        <p class="panorama-disclaimer">Revista editorial de utilidade pública, compilada de fontes oficiais e literatura científica na data acima. Confira a fonte primária antes de agir ou compartilhar.</p>\n        <!-- PANORAMA:END -->\n      </div>\n    </section>\n${sectionHtml}\n  </main>`;

const automationCss = `\n    /* REVISTA_AUTOMATION_STYLES */\n    .shell{max-width:var(--max);margin:0 auto;padding:0 24px}\n    .section{padding:38px 0;border-top:1px solid var(--rule)}\n    .section:nth-of-type(even){background:var(--wash)}\n    .panorama{border-top:0;background:var(--white)!important}\n    .panorama-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:12px}\n    .section-heading h2{font-family:Georgia,"Times New Roman",serif;font-size:clamp(26px,3.2vw,38px);font-weight:500;line-height:1.14;color:var(--navy);margin:5px 0 18px}\n    .section-kicker{font-family:ui-monospace,"SFMono-Regular",Consolas,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-text)}\n    .update-pill,.issue-id{font-family:ui-monospace,"SFMono-Regular",Consolas,monospace;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink2)}\n    .issue-bar{display:flex;justify-content:space-between;gap:16px;padding:10px 0 18px;border-top:2px solid var(--navy)}\n    .article-prose{max-width:860px;color:var(--ink);font-size:16px;line-height:1.72}\n    .article-prose p{margin:0 0 18px}\n    .article-prose h3{margin:28px 0 10px;color:var(--navy);font-size:1.05rem;letter-spacing:-.01em}\n    .article-prose ul{margin:0 0 22px;padding-left:1.25rem}\n    .article-prose li{margin:8px 0}\n    .article-prose a{color:var(--teal-text);overflow-wrap:anywhere}\n    .article-prose .source-line{margin-top:26px;padding-top:16px;border-top:1px solid var(--rule);font-size:13.5px;color:var(--ink2)}\n    .edition-summary{margin:0 0 26px}\n    .toc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;list-style:none;margin:24px 0;padding:0}\n    .toc a{display:flex;gap:12px;height:100%;padding:14px;border:1px solid var(--rule);background:var(--wash);text-decoration:none;color:var(--navy)}\n    .toc b{color:var(--teal-text);font-family:ui-monospace,"SFMono-Regular",Consolas,monospace;font-size:11px}\n    .toc span{font-size:14px;line-height:1.32}\n    .panorama-disclaimer{font-size:12px;color:var(--ink2);margin-top:16px}\n    @media (max-width:720px){.toc{grid-template-columns:1fr}.panorama-head,.issue-bar{align-items:flex-start;flex-direction:column}}\n    @media print{.section{padding:20px 0}.toc{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.toc a{padding:9px}.article-prose{font-size:10.5pt;line-height:1.48}.article-prose h3{break-after:avoid}.source-line{font-size:9pt!important}.panorama-disclaimer{font-size:8.5pt}}\n`;

function assertCurrent(doc) {
  const checks = [
    [`dateModified ${edition}`, new RegExp(`"dateModified"\\s*:\\s*"${edition}"`).test(doc)],
    [`lastReviewed ${edition}`, new RegExp(`"lastReviewed"\\s*:\\s*"${edition}"`).test(doc)],
    [`hero ${editionHuman}`, doc.includes(editionHuman)],
    ['PANORAMA markers', doc.includes('PANORAMA:START') && doc.includes('PANORAMA:END')],
    ['main content', doc.includes('<main id="conteudo">') && doc.includes('</main>')],
  ];
  const failed = checks.filter(([,ok]) => !ok).map(([name]) => name);
  if (failed.length) throw new Error(`QA falhou: ${failed.join('; ')}`);
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
html = html.replace(/Edição verificada · fontes primárias · \d{2}\.\d{2}\.\d{4}/, `Edição em revisão · fontes primárias · ${editionId}`);
html = html.replace(/<h2>[^<]*<\/h2>\s*<p>[^<]*<\/p>\s*<\/div>\s*<div class="meta mono">\s*<span><b>Edição de [^<]*<\/b><\/span>\s*<span><b>Semana<\/b>[^<]*<\/span>/,
  `<h2>${escapeHtml(cleanHeading(sections[0]?.heading || 'Edição semanal'))}</h2>\n      <p>${inline(criterion)}</p>\n    </div>\n    <div class="meta mono">\n      <span><b>${escapeHtml(editionHuman)}</b></span>\n      <span><b>Semana</b> ${escapeHtml(weekHuman.replace(/^Semana de\s*/i, ''))}</span>`);
html = html.replace(/Revista Eletrônica VIA · Saúde na Última Semana · edição de \d{2}\.\d{2}\.\d{4}\./,
  `Revista Eletrônica VIA · Saúde na Última Semana · edição de ${editionId}.`);
html = html.replace(/"dateModified"\s*:\s*"\d{4}-\d{2}-\d{2}"/g, `"dateModified": "${edition}"`);
html = html.replace(/"lastReviewed"\s*:\s*"\d{4}-\d{2}-\d{2}"/g, `"lastReviewed": "${edition}"`);
html = html.replace(/"about"\s*:\s*\[[\s\S]*?\],\s*"specialty"/, `"about": [\n${aboutJson}\n        ],\n        "specialty"`);
if (!html.includes('REVISTA_AUTOMATION_STYLES')) html = html.replace('</style>', `${automationCss}\n  </style>`);

fs.writeFileSync(indexPath, html);
assertCurrent(html);
console.log(`Revista promovida localmente: ${edition}`);
