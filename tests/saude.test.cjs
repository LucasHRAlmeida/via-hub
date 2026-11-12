const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, "..");
const app = path.join(root, "saude");
test("EVAM embarcado é cópia exata da fonte canônica", () => {
  for (const name of ["parser.js", "schemas.js"])
    assert.equal(fs.readFileSync(path.join(app, "vendor/evam", name), "utf8"), fs.readFileSync(path.join(root, "regulacao-federal-ia/evam", name), "utf8"));
});
test("Contrato de cinco dimensões com proveniência e ausência explícita", async () => {
  const { DOMAINS, perceptionEnvelope } = await import(pathToFileURL(path.join(app, "model.js")));
  assert.equal(DOMAINS.length, 5);
  const r = perceptionEnvelope({ sono: { value: "Tenho me sentido bem", recorded: "2026-11-12T12:00:00Z" } }, "VS-TEST");
  assert.equal(r.synthetic, true); assert.equal(r.fields.sono.origin, "autorrelato demonstrativo");
  assert.equal(r.fields.movimento.value, null); assert.equal(r.governance.clinicalRecommendation, false);
  assert.equal(r.governance.riskScore, false); assert.equal(r.governance.externalTransmission, false);
});
test("Cross-links e fronteiras de privacidade permanecem explícitos", () => {
  const html = fs.readFileSync(path.join(app, "index.html"), "utf8");
  const js = fs.readFileSync(path.join(app, "app.js"), "utf8");
  assert.match(html, /https:\/\/iniciativa-via.com\/"/);
  for (const route of ["/via-hub/", "/via-hub/revista/", "/via-hub/regulacao-federal-ia/evam/"]) assert.ok(html.includes(route));
  assert.doesNotMatch(js, /localStorage|sessionStorage|indexedDB|innerHTML|eval\(/);
  assert.doesNotMatch(js, /api\.perplexity|firebase|analytics/);
  assert.match(js, /credentials: "omit"/);
  assert.match(js, /normalize\(r\.admin1\) === normalize\(STATES\[uf\]\)/);
  assert.match(js, /request !== state\.request/);
  assert.match(js, /30 \* 60 \* 1000/);
});
test("Domínio emocional exibe rede de apoio sem interpretar a resposta", async () => {
  const { SUPPORT } = await import(pathToFileURL(path.join(app, "model.js")));
  assert.match(SUPPORT.text, /\b188\b/); assert.match(SUPPORT.text, /\b192\b/);
  assert.match(SUPPORT.url, /^https:\/\/cvv\.org\.br\//);
  const js = fs.readFileSync(path.join(app, "app.js"), "utf8");
  assert.match(js, /d\.key === "emocional"\) fieldset\.append\(supportNote\(\)\)/);
});
