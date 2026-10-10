const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nexoDir = path.join(root, "nexo");

const requiredDocs = ["README.md", "CURADORIA.md", "FONTES_EDUCACAO_SAUDE.md", "VOZ_AUTORAL.md", "avaliacao.md", "SSOT_OPERACAO.md"];
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

assert.equal(contrato.raias.length, 4, "o contrato declara exatamente quatro raias");
const raiaIds = contrato.raias.map((raia) => raia.id);
assert.equal(new Set(raiaIds).size, raiaIds.length, "ids de raia duplicados no contrato");
const raias = new Map(contrato.raias.map((raia) => [raia.id, raia]));
for (const id of ["informacao-saude", "posicionamento-tecnico-filosofico", "modelo-cuidado", "educacao-saude-leigo"]) {
  assert.ok(raias.has(id), `raia ausente no contrato: ${id}`);
  assert.ok(raias.get(id).limites.length > 0, `raia sem limites: ${id}`);
}
assert.deepEqual(
  raias.get("informacao-saude").fontes,
  ["nivel-1-diretrizes-sociedades-brasileiras", "nivel-2-literatura-e-agencias"],
  "fontes clinicas devem manter os niveis 1 e 2, nesta ordem"
);

const ssot = fs.readFileSync(path.join(nexoDir, "SSOT_OPERACAO.md"), "utf8");
const curadoria = fs.readFileSync(path.join(nexoDir, "CURADORIA.md"), "utf8");
assert.match(ssot, /FONTES_EDUCACAO_SAUDE\.md/, "SSOT_OPERACAO.md nao referencia o indice de educacao em saude");
assert.match(curadoria, /FONTES_EDUCACAO_SAUDE\.md/, "CURADORIA.md nao referencia o indice de educacao em saude");

for (const campo of [
  "entidade", "titulo", "edicaoOuVersao", "dataPublicacao", "dataConsulta",
  "referenciaPublica", "trechoCitado", "parafraseIndicada"
]) {
  assert.ok(contrato.registroMinimoFonte.includes(campo), `registro minimo sem o campo: ${campo}`);
}

assert.equal(contrato.privacidade.escopo, "fundacao-estatica");
assert.equal(contrato.privacidade.capturaDadosPessoais, false);
assert.equal(contrato.privacidade.loginOuPersistencia, false);
assert.equal(contrato.adaptadorWhatsApp.status, "diferido");
assert.ok(contrato.adaptadorWhatsApp.requerDecisaoMantenedor.length > 0, "adaptador sem pendencias declaradas");

const forbidden = ["sk_", "xoxb-", "AKIA", "-----BEGIN PRIVATE KEY-----", "whatsapp_token", "META_APP_SECRET"];
const scanned = [adr];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else scanned.push(fullPath);
  }
};
walk(nexoDir);
assert.ok(scanned.length > requiredDocs.length + 1, "varredura de segredos nao cobre o diretorio nexo");
for (const file of scanned) {
  const content = fs.readFileSync(file, "utf8");
  for (const secret of forbidden) {
    assert.ok(!content.includes(secret), `${path.relative(root, file)} contem padrao vedado: ${secret}`);
  }
}

console.log("NEXO_CONTRATO_OK");
