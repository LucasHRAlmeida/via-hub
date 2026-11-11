const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const htmlPath = path.join(__dirname, "..", "regulacao-federal-ia", "lab", "index.html");

function element() {
  return {
    value: "",
    textContent: "",
    innerHTML: "",
    style: { display: "", background: "" },
    addEventListener() {},
  };
}

function loadLab() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, "script do lab ausente");

  const sandbox = {
    // window.status é string e sombreia um elemento com id="status".
    status: "",
  };
  const dom = {};
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    const id = match[1];
    const node = element();
    dom[id] = node;
    if (typeof sandbox[id] === "string") continue;
    sandbox[id] = node;
  }

  vm.createContext(sandbox);
  vm.runInContext(scriptMatch[1], sandbox, { filename: "regulacao-federal-ia/lab/index.html" });
  return { sandbox, dom };
}

const { sandbox, dom } = loadLab();

assert.equal(typeof sandbox.status, "string");
assert.ok(dom.matchStatus, "o indicador não pode usar id=status");
assert.equal(dom.matchStatus.textContent, "RANKING EXPERIMENTAL");
assert.match(dom.results.innerHTML, /1\. Centro Executor Alfa/);
assert.match(dom.results.innerHTML, /-100/);
assert.match(dom.audit.textContent, /Centro Executor Alfa/);
assert.equal(dom.audit.textContent.includes("1º=Centro Executor Alfa"), true);

sandbox.preset("missing");
assert.equal(dom.matchStatus.textContent, "ABSTENTION");
assert.match(dom.results.innerHTML, /Insuficiente para recomendar/);
assert.match(dom.audit.textContent, /ABSTENTION/);

sandbox.preset("expired");
assert.equal(dom.matchStatus.textContent, "ABSTENTION · TTL");
assert.match(dom.results.innerHTML, /expirado/);

sandbox.preset("queueExtreme");
assert.equal(dom.matchStatus.textContent, "RE-MATCH / ESCALAÇÃO");
assert.equal(dom.queueBanner.style.display, "block");
assert.match(dom.results.innerHTML, /Sepse biliar/);

sandbox.preset("anchor");
sandbox.need.value = "hemo";
sandbox.daysInQueue.value = "1";
sandbox.run();
assert.equal(dom.matchStatus.textContent, "RE-MATCH / ESCALAÇÃO");

sandbox.need.value = "cpre";
sandbox.daysInQueue.value = "1";
sandbox.run();
assert.equal(dom.matchStatus.textContent, "RANKING EXPERIMENTAL");
assert.match(dom.results.innerHTML, /Centro Executor Alfa/);

console.log("lab-matching: ok");
