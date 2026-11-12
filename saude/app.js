import { DOMAINS, INTENTIONS, LINKS, STATES, normalize, perceptionEnvelope } from "./model.js";
import { SCHEMA_TEMPLATES, getSchema, getFieldDefinition, EVAM_VERSION } from "./vendor/evam/schemas.js";
import { extractNarrative, redactDirectIdentifiers, buildEnvelope, formatRegulatoryText, missingRequiredFields, stampRecorded } from "./vendor/evam/parser.js";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = { view: "chegar", intent: "pausa", answers: {}, step: 0, report: null, fields: null, source: "", envelope: null, weather: null, request: 0, controller: null };
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text, action, cls = "quiet") {
  const b = el("button", text, cls); b.type = "button"; b.addEventListener("click", action); return b;
}
function sourceLink(text, url) {
  const a = el("a", text, "source-link"); a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; return a;
}
function download(content, filename, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = el("a"); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
function showView(view, focus = true) {
  if (!["chegar", "percepcoes", "evam", "mundo"].includes(view)) view = "chegar";
  state.view = view;
  $$(".view").forEach(n => { n.hidden = n.id !== `view-${view}`; });
  $$(".tabs button").forEach(n => { if (n.dataset.view === view) n.setAttribute("aria-current", "page"); else n.removeAttribute("aria-current"); });
  if (view === "percepcoes") state.report ? renderReport() : renderQuestion();
  if (view !== "chegar") closePlayer();
  if (focus) { $("#main").focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }
}
$$("[data-view]").forEach(n => n.addEventListener("click", e => { e.preventDefault(); showView(n.dataset.view); }));

function closePlayer() {
  $("#player").replaceChildren(); $("#player").hidden = true; $("#listen").setAttribute("aria-expanded", "false");
  $("#listen").textContent = `Escutar · ${INTENTIONS[state.intent].playlistName} ↗`;
}
function renderIntent() {
  const intent = INTENTIONS[state.intent];
  $("#intent-head").textContent = intent.title; $("#intent-description").textContent = intent.description;
  $$("[data-intent]").forEach(n => n.setAttribute("aria-pressed", String(n.dataset.intent === state.intent)));
  closePlayer();
  $("#paths").replaceChildren(...intent.links.map(key => {
    const item = LINKS[key], a = el("a", undefined, "path"); a.href = item.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.append(el("span", item.tag, "eyebrow"), el("h3", item.label), el("p", item.text), el("span", "↗", "arrow")); return a;
  }));
}
$$("[data-intent]").forEach(n => n.addEventListener("click", () => { state.intent = n.dataset.intent; renderIntent(); }));
$("#listen").addEventListener("click", () => {
  if (!$("#player").hidden) return closePlayer();
  const iframe = el("iframe"); const intent = INTENTIONS[state.intent];
  iframe.src = `https://open.spotify.com/embed/playlist/${intent.playlist}?theme=0`;
  iframe.title = `Playlist ${intent.playlistName} da Sala VIA`;
  iframe.allow = "encrypted-media; fullscreen; picture-in-picture"; iframe.referrerPolicy = "no-referrer";
  $("#player").append(el("p", "Ao abrir o player, você se conecta ao Spotify. A reprodução só começa por sua iniciativa.", "small muted"), iframe);
  $("#player").hidden = false; $("#listen").setAttribute("aria-expanded", "true"); $("#listen").textContent = "Fechar player";
});

function setAnswer(value) { state.answers[DOMAINS[state.step].key] = { value, recorded: stampRecorded() }; }
function renderQuestion() {
  const area = $("#question-area"), d = DOMAINS[state.step];
  area.replaceChildren();
  const meta = el("div", undefined, "step-meta"); meta.append(el("span", `${String(state.step + 1).padStart(2, "0")} / 05`), el("span", d.title));
  const progress = el("div", undefined, "progress"); progress.setAttribute("role", "progressbar"); progress.setAttribute("aria-valuenow", state.step + 1); progress.setAttribute("aria-valuemin", "0"); progress.setAttribute("aria-valuemax", "5"); progress.setAttribute("aria-label", "Etapa do questionário");
  const fill = el("span"); fill.style.width = `${(state.step + 1) * 20}%`; progress.append(fill);
  const fieldset = el("fieldset"); fieldset.append(el("legend", d.question), el("p", d.note, "small muted"));
  const options = el("div", undefined, "options");
  d.options.forEach((text, i) => {
    const label = el("label", undefined, "option"), input = el("input"); input.type = "radio"; input.name = d.key; input.value = text; input.id = `answer-${d.key}-${i}`;
    input.checked = state.answers[d.key]?.value === text; input.addEventListener("change", () => setAnswer(text));
    label.append(input, el("span", text)); options.append(label);
  });
  fieldset.append(options);
  const actions = el("div", undefined, "question-actions");
  const back = button("Voltar", () => { state.step = Math.max(0, state.step - 1); renderQuestion(); });
  back.disabled = state.step === 0;
  const nextGroup = el("div");
  const advance = () => {
    if (state.step < 4) { state.step++; renderQuestion(); }
    else { state.report = perceptionEnvelope(state.answers, `VS-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`); renderReport(); }
  };
  nextGroup.append(button("Pular", () => { setAnswer(null); advance(); }, "text-link"), button(state.step === 4 ? "Ver minhas percepções ↗" : "Continuar ↗", advance, "primary"));
  actions.append(back, nextGroup); area.append(meta, progress, fieldset, actions);
}
function renderReport() {
  const r = state.report, area = $("#question-area"); area.replaceChildren();
  area.append(el("p", `${r.id} · Demonstração fictícia`, "report-id"), el("h2", "Percepções, com as suas palavras."));
  const dl = el("dl", undefined, "report-grid");
  DOMAINS.forEach(d => { const row = el("div", undefined, "report-row"); row.append(el("dt", d.title), el("dd", r.fields[d.key].value ?? "Não informado")); dl.append(row); });
  area.append(dl, el("p", "Ponto de partida, não conclusão. Estas respostas não receberam interpretação clínica, escore ou recomendação de conduta.", "notice"));
  const actions = el("div", undefined, "actions");
  actions.append(button("Baixar minhas percepções", () => { download(JSON.stringify(r, null, 2), `${r.id}.json`); $("#session-status").textContent = "Exportação demonstrativa solicitada. O arquivo contém percepções, origem e data, não uma avaliação clínica."; }, "primary"));
  actions.append(button("Recomeçar", () => { state.answers = {}; state.step = 0; state.report = null; renderQuestion(); }));
  area.append(actions, el("p", `Origem: autorrelato demonstrativo · Registrado em ${new Date(r.recorded).toLocaleString("pt-BR")}.`, "small muted"));
}
$("#example-record").addEventListener("click", () => {
  const values = ["Tenho me sentido bem", "Aconteceu de vez em quando", "Tenho me sentido bem", "Tenho vivido dias variados", "Talvez, mais adiante"];
  const answers = Object.fromEntries(DOMAINS.map((d, i) => [d.key, { value: values[i], recorded: "2025-06-18T12:00:00Z" }]));
  state.report = perceptionEnvelope(answers, "VS-2048", "2025-06-18T12:00:00Z"); renderReport();
});

// Examples are synthetic fixtures, never a claim about the visitor.
const examples = [
  "Mulher, 81 anos. Febre, icterícia e dor abdominal. Reconhecimento de colangite com sepse há 18 horas. PA 80/45 mmHg, FC 118 bpm, FR 26 irpm, SpO2 93% em cateter nasal 3 L/min, Glasgow 14. Lactato 4,1 mmol/L, creatinina 2,8 mg/dL, bilirrubina total 12,9 mg/dL. Noradrenalina 0,12 mcg/kg/min. TC evidencia dilatação biliar e provável coledocolitíase. Unidade sem CPRE. Solicita-se transferência para controle de foco e suporte intensivo.",
  "Homem, 62 anos. Dor torácica iniciada há 3 horas. PA 92/58 mmHg, FC 104 bpm, SpO2 94%. ECG: supradesnivelamento de ST em parede anterior. Troponina elevada. Unidade sem hemodinâmica.",
  "Mulher, 67 anos. Último momento bem às 07:10. Afasia e hemiparesia direita. PA 178/96 mmHg, Glasgow 13, NIHSS 16. TC de crânio sem hemorragia; angioTC sugere oclusão de grande vaso. Unidade sem neurorradiologia intervencionista.",
  "Homem, 34 anos. Colisão automobilística há 2 horas. PA 78/44 mmHg, FC 132 bpm, FR 30 irpm, SpO2 91%, Glasgow 11. Sangramento ativo em pelve. Lactato 5,2 mmol/L, pH 7,21, INR 1,6. TC: fratura pélvica e líquido livre abdominal. Unidade sem banco de sangue.",
  "Mulher, 49 anos. Insuficiência respiratória reconhecida há 10 horas. PA 105/64 mmHg, FC 116 bpm, FR 34 irpm, SpO2 82% em máscara com reservatório. Ventilação mecânica. Gasometria: pH 7,18, PaO2 52 mmHg em FiO2 100%, lactato 3,0 mmol/L. TC de tórax com infiltrado bilateral difuso.",
  "Homem, 58 anos. Cefaleia súbita e rebaixamento há 4 horas. PA 188/104 mmHg, FC 54 bpm, Glasgow 9. Pupilas anisocóricas; hemiparesia direita. TC de crânio: hematoma intraparenquimatoso com efeito de massa. Plaquetas 180 mil, INR 1,1. Unidade sem neurocirurgia."
];
const schemaSelect = $("#schema-select");
SCHEMA_TEMPLATES.forEach(s => { const o = el("option", s.syndrome); o.value = s.id; schemaSelect.append(o); });
function clearConversion() {
  state.fields = null; state.source = ""; state.envelope = null;
  $("#field-review").replaceChildren(); $("#envelope").textContent = ""; $("#evam-result").hidden = true; $("#evam-message").textContent = "";
}
function schemaChanged() {
  clearConversion(); $("#schema-purpose").textContent = `${getSchema(schemaSelect.value).purpose} · EVAM ${EVAM_VERSION}`;
}
schemaSelect.addEventListener("change", schemaChanged);
$("#narrative").addEventListener("input", () => {
  if (state.fields) { clearConversion(); $("#evam-message").textContent = "A narrativa mudou. Converta novamente para não usar a estrutura anterior."; }
});
$("#evam-example").addEventListener("click", () => { clearConversion(); $("#narrative").value = examples[schemaSelect.selectedIndex]; $("#evam-message").textContent = "Exemplo inteiramente sintético carregado. Confira o template e converta."; });
$("#evam-clear").addEventListener("click", () => { $("#narrative").value = ""; clearConversion(); });
$("#convert").addEventListener("click", () => {
  const text = $("#narrative").value.trim();
  if (!text) { $("#evam-message").textContent = "Insira uma narrativa fictícia ou carregue um exemplo antes de converter."; return; }
  const schema = getSchema(schemaSelect.value);
  state.source = redactDirectIdentifiers(text); state.fields = extractNarrative(state.source, schema);
  $("#field-review").replaceChildren(...schema.fields.map(key => {
    const def = getFieldDefinition(key), item = state.fields[key], div = el("div", undefined, `field${def.type === "textarea" ? " wide" : ""}`);
    const label = el("label", `${def.label}${def.unit ? ` (${def.unit})` : ""}${schema.required.includes(key) ? " · obrigatório" : ""}`); label.htmlFor = `field-${key}`;
    const input = el(def.type === "textarea" ? "textarea" : "input"); input.id = `field-${key}`; input.value = item.value ?? "";
    if (input.tagName === "INPUT") { input.type = def.type || "text"; if (def.step) input.step = def.step; }
    input.setAttribute("aria-describedby", `provenance-${key}`);
    const provenance = el("p", undefined, `source-meta${item.origin === "template selecionado" ? " template-tag" : ""}`); provenance.id = `provenance-${key}`;
    const updateProvenance = () => {
      const f = state.fields[key];
      provenance.textContent = `${f.origin === "template selecionado" ? "SUGESTÃO DE TEMPLATE, NÃO EXTRAÍDA DA NARRATIVA" : f.value === "" ? "Não localizado / não informado" : f.origin} · ${f.confidence} · ${new Date(f.recorded).toLocaleString("pt-BR")}`;
    };
    input.addEventListener("input", () => {
      state.fields[key] = { ...state.fields[key], value: def.type === "number" && input.value !== "" ? Number(input.value) : input.value.trim(), origin: "edição humana", confidence: "editado, sem validação clínica", recorded: stampRecorded() };
      updateProvenance(); refreshEnvelope(); $("#review-message").textContent = "Edição incorporada ao envelope. Editar um campo não equivale a validar o episódio.";
    });
    div.append(label, input, provenance);
    if (item.excerpt) div.append(el("blockquote", `Trecho de origem: “${item.excerpt}”`));
    updateProvenance(); return div;
  }));
  $("#evam-result").hidden = false;
  $("#review-message").textContent = "Confira os valores e suas origens. Nenhuma saída foi validada clinicamente.";
  $("#evam-message").textContent = "Narrativa convertida localmente. Os campos e as lacunas estão abaixo.";
  refreshEnvelope();
});
function refreshEnvelope() {
  if (!state.fields) return;
  const schema = getSchema(schemaSelect.value);
  state.envelope = buildEnvelope({ sourceText: state.source, schema, fields: state.fields, includeSource: false });
  const missing = missingRequiredFields(state.fields, schema);
  const suggested = schema.required.filter(k => state.fields[k].origin === "template selecionado");
  $("#missing").textContent = `${missing.length ? `Lacunas obrigatórias: ${missing.map(k => getFieldDefinition(k).label).join("; ")}.` : "Os campos obrigatórios estão preenchidos; isso não comprova completude ou correção clínica."}${suggested.length ? ` Exigem confirmação porque vieram do template: ${suggested.map(k => getFieldDefinition(k).label).join("; ")}.` : ""} Revisão humana necessária.`;
  $("#envelope").textContent = JSON.stringify(state.envelope, null, 2);
}
$("#update-envelope").addEventListener("click", () => { refreshEnvelope(); $("#review-message").textContent = "Estrutura atualizada a partir dos campos visíveis. Permanece sem validação clínica e sem envio ao servidor."; });
$("#export-evam").addEventListener("click", () => { refreshEnvelope(); if (state.envelope) download(JSON.stringify(state.envelope, null, 2), "EVAM-demonstracao.json"); });
$("#export-summary").addEventListener("click", () => { refreshEnvelope(); if (state.envelope) download(formatRegulatoryText(state.envelope), "EVAM-resumo-demonstrativo.txt", "text/plain;charset=utf-8"); });

Object.entries(STATES).sort((a,b) => a[1].localeCompare(b[1], "pt-BR")).forEach(([uf, name]) => { const o = el("option", `${name} · ${uf}`); o.value = uf; $("#uf").append(o); });
$("#uf").prepend(Object.assign(el("option", "Escolha uma UF"), { value: "" })); $("#uf").value = "";
function resetWorld() {
  state.request++; state.controller?.abort(); state.weather = null;
  $("#city-results").replaceChildren(); $("#weather").replaceChildren(); $("#weather").hidden = true;
  $("#world-status").textContent = "Contexto alterado. Consulte novamente para este território."; $("#weather-search").disabled = false;
  $("#territory-label").textContent = $("#uf").value ? `Território escolhido: ${STATES[$("#uf").value]}` : "Uma janela para o território";
}
$("#uf").addEventListener("change", resetWorld); $("#city").addEventListener("input", resetWorld);
async function publicJson(url, signal) {
  const boundedSignal = AbortSignal.any([signal, AbortSignal.timeout(12000)]);
  const r = await fetch(url, { signal: boundedSignal, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!r.ok) throw new Error(`Serviço retornou HTTP ${r.status}`);
  return r.json();
}
$("#weather-search").addEventListener("click", async () => {
  const city = $("#city").value.trim(), uf = $("#uf").value;
  if (!uf || city.length < 2) { $("#world-status").textContent = "Escolha uma UF e informe uma cidade antes de consultar."; return; }
  resetWorld();
  const request = state.request;
  state.controller = new AbortController();
  $("#weather-search").disabled = true; $("#world-status").textContent = "Consultando localidades no Open-Meteo…";
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=20&language=pt&format=json&countryCode=BR`;
    const data = await publicJson(url, state.controller.signal);
    if (request !== state.request) return;
    const found = (data.results || []).filter(r => r.country_code === "BR" && normalize(r.admin1) === normalize(STATES[uf]) && normalize(r.name) === normalize(city));
    if (!found.length) { $("#world-status").textContent = "Não encontramos correspondência exata nesta UF. Revise o nome da cidade. Nenhum dado climático foi presumido."; return; }
    $("#world-status").textContent = "Confirme a localidade para consultar o clima:";
    $("#city-results").replaceChildren(...found.map(r => button(`${r.name} · ${r.admin2 || r.admin1} · ${uf} ↗`, () => loadWeather(r, request), "city-option")));
  } catch (error) {
    if (request === state.request && error.name !== "AbortError") $("#world-status").textContent = "A fonte externa não respondeu. Tente novamente mais tarde. Não exibimos valores substitutos.";
  } finally { if (request === state.request) $("#weather-search").disabled = false; }
});
async function loadWeather(location, request) {
  if (request !== state.request) return;
  const serial = ++state.request;
  state.controller?.abort(); state.controller = new AbortController();
  $("#city-results").replaceChildren(); $("#world-status").textContent = "Consultando o modelo meteorológico…"; $("#weather-search").disabled = true;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=UTC`;
    const data = await publicJson(url, state.controller.signal);
    if (serial !== state.request) return;
    const c = data.current;
    if (!c || ![c.temperature_2m, c.relative_humidity_2m, c.precipitation].every(Number.isFinite) || !c.time) throw new Error("Incomplete data");
    const observedAt = new Date(`${c.time}Z`).getTime();
    if (!Number.isFinite(observedAt)) throw new Error("Invalid timestamp");
    state.weather = { location, data, consulted: Date.now(), observedAt, sourceUrl: url };
    renderWeather(); $("#world-status").textContent = "Consulta concluída. Confira a hora do modelo e os limites de validade abaixo.";
  } catch (error) {
    if (serial === state.request && error.name !== "AbortError") { state.weather = null; $("#weather").hidden = true; $("#world-status").textContent = "Não foi possível obter um contexto completo. Nenhum valor foi inventado."; }
  } finally { if (serial === state.request) $("#weather-search").disabled = false; }
}
function renderWeather() {
  if (!state.weather) return;
  const w = state.weather, c = w.data.current, stale = Date.now() - w.consulted > 30 * 60 * 1000 || Math.abs(Date.now() - w.observedAt) > 90 * 60 * 1000;
  const area = $("#weather"); area.replaceChildren();
  area.append(el("h2", `${w.location.name} · ${w.location.admin1}`, "weather-heading"));
  if (stale) {
    area.append(el("p", "Contexto desatualizado. Faça uma nova consulta para ver os valores. A interface oculta os números após 30 minutos da consulta ou 90 minutos da hora do modelo.", "notice"));
  } else {
    const values = el("div", undefined, "weather-values");
    [[`${c.temperature_2m} °C`, "Temperatura a 2 m"], [`${c.relative_humidity_2m}%`, "Umidade relativa"], [`${c.precipitation} mm`, "Precipitação no intervalo"]].forEach(([v,l]) => { const div = el("div"); div.append(el("strong", v), el("span", l)); values.append(div); });
    area.append(values);
  }
  area.append(el("p", "Estimativa meteorológica por modelo. Não é uma medição individual nem um alerta sanitário.", "local-note"));
  const meta = el("p", `Hora do modelo: ${new Date(w.observedAt).toLocaleString("pt-BR")} · Consulta: ${new Date(w.consulted).toLocaleString("pt-BR")}. `, "small muted");
  meta.append(sourceLink("Open-Meteo · resposta consultada", w.sourceUrl)); area.append(meta);
  area.append(el("p", "Janela de atualização da interface: 30 minutos. Uso demonstrativo não comercial. Dados meteorológicos: Open-Meteo, CC BY 4.0.", "small muted"));
  area.append(button("Atualizar este contexto", () => loadWeather(w.location, state.request), "quiet"));
  area.hidden = false;
}
setInterval(() => { if (state.weather) renderWeather(); }, 60000);
$("#clear-session").addEventListener("click", () => {
  state.answers = {}; state.report = null; state.step = 0; state.intent = "pausa";
  $("#narrative").value = ""; schemaSelect.selectedIndex = 0; schemaChanged(); closePlayer(); $("#uf").value = ""; $("#city").value = ""; resetWorld(); renderIntent(); showView("chegar");
  $("#world-status").textContent = "Nenhuma consulta externa realizada.";
  $("#session-status").textContent = "Memória da sessão apagada. Arquivos que você já baixou não são removidos.";
});
schemaChanged(); renderIntent(); showView("chegar", false);
