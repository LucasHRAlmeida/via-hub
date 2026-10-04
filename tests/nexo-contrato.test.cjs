const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nexoDir = path.join(root, "nexo");

const requiredDocs = ["README.md", "CURADORIA.md", "VOZ_AUTORAL.md", "avaliacao.md"];
for (const doc of requiredDocs) {
  assert.ok(fs.existsSync(path.join(nexoDir, doc)), `nexo/${doc} ausente`);
}

const adr = path.join(root, "docs", "decisoes", "0002-nexo-fundacao.md");
assert.ok(fs.existsSync(adr), "docs/decisoes/0002-nexo-fundacao.md ausente");

const raw = fs.readFileSync(path.join(nexoDir, "contrato-nexo.json"), "utf8");
const contrato = JSON.parse(raw);

assert.equal(contrato.nome, "Nexo");
assert.match(contrato.versao, /^\d+\.\d+\.\d+$/);
assert.equal(contrato.estagio, "fundacao-estatica");

const raias = new Map(contrato.raias.map((raia) => [raia.id, raia]));
for (const id of ["informacao-saude", "posicionamento-tecnico-filosofico", "modelo-cuidado"]) {
  assert.ok(raias.has(id), `raia ausente no contrato: ${id}`);
  assert.ok(raias.get(id).limites.length > 0, `raia sem limites: ${id}`);
}

assert.equal(contrato.privacidade.capturaDadosPessoais, false);
assert.equal(contrato.adaptadorWhatsApp.status, "diferido");
assert.ok(contrato.adaptadorWhatsApp.requerDecisaoMantenedor.length > 0, "adaptador sem pendencias declaradas");

const forbidden = ["sk_", "xoxb-", "AKIA", "-----BEGIN PRIVATE KEY-----", "whatsapp_token", "META_APP_SECRET"];
const scanned = [...requiredDocs.map((doc) => path.join(nexoDir, doc)), path.join(nexoDir, "contrato-nexo.json"), adr];
for (const file of scanned) {
  const content = fs.readFileSync(file, "utf8");
  for (const secret of forbidden) {
    assert.ok(!content.includes(secret), `${path.relative(root, file)} contem padrao vedado: ${secret}`);
  }
}

console.log("NEXO_CONTRATO_OK");
