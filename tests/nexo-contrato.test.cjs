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

const perguntasDir = path.join(root, "perguntas");
const fichas = [];
const walkPerguntas = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkPerguntas(fullPath);
    else if (entry.name.endsWith(".md") && entry.name !== "README.md" && entry.name !== "ESCOPO.md") {
      fichas.push(fullPath);
    }
  }
};
walkPerguntas(perguntasDir);
assert.equal(fichas.length, 21, "o corpus deve conter exatamente 21 fichas");

const idsFichas = new Set();
const estadosPermitidos = new Set(["pendente_verificacao", "parcial", "respondida"]);
const campoYaml = (texto, campo, indentacao = 4) => {
  const chave = campo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const padrao = campo === "entidade" ? `^\\s{2}-\\s+${chave}:\\s*(.*)$` : `^\\s{${indentacao}}${chave}:\\s*(.*)$`;
  const correspondencia = texto.match(new RegExp(padrao, "m"));
  return correspondencia?.[1].trim();
};
for (const ficha of fichas) {
  const caminhoRelativo = path.relative(root, ficha);
  const conteudo = fs.readFileSync(ficha, "utf8");
  const blocoYaml = conteudo.match(/```yaml\s*([\s\S]*?)```/);
  assert.ok(blocoYaml, `${caminhoRelativo} sem bloco YAML`);
  const yaml = blocoYaml[1];
  const id = yaml.match(/^\s+id:\s*"([^"]+)"/m)?.[1];
  const status = yaml.match(/^\s+status:\s*"([^"]+)"/m)?.[1];
  assert.ok(id, `${caminhoRelativo} sem id`);
  assert.ok(!idsFichas.has(id), `id de ficha duplicado: ${id}`);
  idsFichas.add(id);
  assert.ok(estadosPermitidos.has(status), `${caminhoRelativo} com estado inválido: ${status}`);

  const indiceFontes = yaml.indexOf("\nfontes:\n");
  const indiceResposta = yaml.indexOf("\nresposta:\n", indiceFontes);
  const fonteYaml = indiceFontes >= 0 ? yaml.slice(indiceFontes + 8, indiceResposta >= 0 ? indiceResposta : undefined) : "";
  const respostaYaml = indiceResposta >= 0 ? yaml.slice(indiceResposta + 10) : "";
  if (status === "pendente_verificacao") {
    assert.equal(indiceFontes, -1, `${caminhoRelativo} pendente não pode declarar fontes verificadas`);
    assert.equal(indiceResposta, -1, `${caminhoRelativo} pendente não pode conter resposta`);
    continue;
  }

  assert.ok(indiceFontes >= 0, `${caminhoRelativo} sem fontes verificadas`);
  assert.ok(indiceResposta >= 0, `${caminhoRelativo} sem resposta`);
  const fontes = fonteYaml.split(/(?=^  - entidade:)/m).filter((fonte) => fonte.trim());
  assert.ok(fontes.length > 0, `${caminhoRelativo} sem registros de fonte`);
  for (const fonte of fontes) {
    for (const campo of contrato.registroMinimoFonte) {
      assert.ok(campoYaml(fonte, campo), `${caminhoRelativo} com fonte sem ${campo}`);
    }
    for (const campo of ["entidade", "titulo", "edicaoOuVersao", "dataConsulta", "trechoCitado"]) {
      const valor = campoYaml(fonte, campo);
      assert.ok(valor && valor !== "null" && valor !== '""', `${caminhoRelativo} com fonte sem valor para ${campo}`);
    }
    const referenciaPublica = campoYaml(fonte, "referenciaPublica");
    assert.match(referenciaPublica, /^"(?:https?):\/\/[^"\s]+"$/, `${caminhoRelativo} com referência pública inválida`);
    const dataPublicacao = campoYaml(fonte, "dataPublicacao");
    if (dataPublicacao === "null") {
      assert.ok(campoYaml(fonte, "motivoAusenciaDataPublicacao"), `${caminhoRelativo} sem motivo para data de publicação ausente`);
    }
    assert.equal(campoYaml(fonte, "parafraseIndicada"), "true", `${caminhoRelativo} não indica paráfrase`);
    for (const campo of ["dataConsulta", "dataUltimaRevalidacao", "proximoVencimento"]) {
      const data = campoYaml(fonte, campo)?.replace(/^"(.*)"$/, "$1");
      assert.match(data, /^\d{4}-\d{2}-\d{2}$/, `${caminhoRelativo} com ${campo} inválida`);
    }
  }

  for (const campo of ["tipo", "limite", "sintese", "encerramento"]) {
    const valor = campoYaml(respostaYaml, campo, 2);
    assert.ok(valor && valor !== "null" && valor !== '""', `${caminhoRelativo} sem resposta.${campo}`);
  }
  if (status === "parcial") {
    assert.ok(campoYaml(respostaYaml, "pendencia", 2), `${caminhoRelativo} parcial sem pendência declarada`);
  } else {
    assert.ok(!campoYaml(respostaYaml, "pendencia", 2), `${caminhoRelativo} respondida ainda tem pendência`);
  }
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
