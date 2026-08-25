const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const htmlPath = path.join(__dirname, "..", "escala-movel-evidencia", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const canonicalUrl = "https://iniciativa-via.com/via-hub/escala-movel-evidencia/";
const externalTarget = "https://escala-movel-evidencia.doctorparnassus.chatgpt.site";
assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/);
assert.doesNotMatch(html, /doctorparnassus|chatgpt\.site/i);
for (const protectedLine of [
  "Dr Lucas HR — Médico Generalista (FMRP-USP)",
  "CRM-SP: 226836 | CRM-MG: 109752",
  "Iniciativa VIA — Vida Integrada e Autônoma",
  "Ciência e Tecnologia a serviço do Cuidado."
]) assert.ok(html.includes(protectedLine), `rodapé protegido ausente: ${protectedLine}`);

const projects = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "projects.json"), "utf8"));
const escala = projects.projects.find((project) => project.id === "escala-movel-evidencia");
assert.ok(escala, "projeto escala-movel-evidencia ausente do catálogo");
assert.equal(escala.url, canonicalUrl);

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const sitemap = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
assert.ok(app.includes(canonicalUrl), "fallback do catálogo não aponta para a rota canônica");
assert.ok(sitemap.includes(`<loc>${canonicalUrl}</loc>`), "rota canônica ausente do sitemap");
assert.ok(!app.includes(externalTarget), "fallback ainda contém o alvo externo do incidente");
assert.ok(!JSON.stringify(projects).includes(externalTarget), "catálogo ainda contém o alvo externo do incidente");

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, "IDs HTML devem ser únicos");
const referencedIds = [...html.matchAll(/\bel\("([^"]+)"\)/g)].map((m) => m[1]);
for (const id of referencedIds) assert.ok(ids.includes(id), `elemento #${id} não existe`);

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, "script inline ausente");

const source = scriptMatch[1];
const wiringMarker = "  campos.forEach(function(id){";
const wiringIndex = source.indexOf(wiringMarker);
assert.ok(wiringIndex > 0, "marcador da inicialização ausente");

const testableSource = source.slice(0, wiringIndex) + `
  globalThis.__escalaTest = { calcular, nivel, analisarCredal };
})();`;
vm.runInThisContext(testableSource, { filename: "escala-movel-inline.js" });

const { calcular, analisarCredal } = globalThis.__escalaTest;
const base = {
  danoDoenca: 70,
  irrevDoenca: 1.5,
  eficacia: 50,
  danoIatro: 25,
  irrevIatro: 1,
  probIatro: 10,
  prob: 40,
  janela: 0.10
};

const quaseIgual = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
const faixaValida = (f, min, max) =>
  Number.isFinite(f.min) && Number.isFinite(f.max) &&
  f.min <= f.max && f.min >= min && f.max <= max;

const pontoBase = calcular(base);
assert.equal(pontoBase.agir, true);
assert.ok(quaseIgual(pontoBase.pt, 100 * 0.025 / 0.55));

const inicio = performance.now();
const credalBase = analisarCredal(base, pontoBase);
const duracaoMs = performance.now() - inicio;
assert.equal(credalBase.resultados.length, 81);
assert.equal(credalBase.dominancia, "tratar");
assert.ok(faixaValida(credalBase.tratar, 0, 1));
assert.ok(faixaValida(credalBase.virar, 0, 1));
assert.ok(faixaValida(credalBase.alta, 0, 1));
assert.ok(faixaValida(credalBase.entropia, 0, 1));
assert.ok(credalBase.evppi.min >= -1e-12);

const repeticao = analisarCredal(base, pontoBase);
assert.deepEqual(repeticao, credalBase, "a integração exata deve ser reprodutível");

const fronteira = { ...base, prob: 5 };
const credalFronteira = analisarCredal(fronteira, calcular(fronteira));
assert.equal(credalFronteira.dominancia, "indeterminada");
assert.ok(credalFronteira.evppi.max > 0);
assert.ok(credalFronteira.virar.max > 0);

const abaixo = { ...base, prob: 1 };
const credalAbaixo = analisarCredal(abaixo, calcular(abaixo));
assert.equal(credalAbaixo.dominancia, "não tratar");

console.log(JSON.stringify({
  status: "ESCALA_CREDAL_OK",
  vertices: credalBase.resultados.length,
  estados_por_vertice: 81,
  duracao_ms: Number(duracaoMs.toFixed(1)),
  base: {
    limiar: Number(pontoBase.pt.toFixed(3)),
    dominancia: credalBase.dominancia,
    p_tratar: credalBase.tratar,
    evppi: credalBase.evppi
  },
  fronteira: {
    dominancia: credalFronteira.dominancia,
    p_tratar: credalFronteira.tratar,
    evppi: credalFronteira.evppi
  }
}, null, 2));
