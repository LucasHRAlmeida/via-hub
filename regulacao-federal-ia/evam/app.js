import { SCHEMA_TEMPLATES, getSchema, getFieldDefinition } from "./schemas.js";
import {
  redactDirectIdentifiers,
  extractNarrative,
  missingRequiredFields,
  buildEnvelope,
  buildJsonSchema,
  formatRegulatoryText,
} from "./parser.js";

const $ = (selector) => document.querySelector(selector);
const elements = {
  schema: $("#schema-select"),
  schemaMeta: $("#schema-meta"),
  narrative: $("#narrative"),
  redact: $("#redact"),
  includeSource: $("#include-source"),
  process: $("#process"),
  example: $("#example"),
  clear: $("#clear"),
  reviewSection: $("#review-section"),
  reviewForm: $("#review-form"),
  reviewStatus: $("#review-status"),
  outputSection: $("#output-section"),
  output: $("#output"),
  copy: $("#copy"),
  download: $("#download"),
  toast: $("#toast"),
};

const state = {
  fields: null,
  sourceText: "",
  format: "text",
};

const examples = {
  "sepsis-biliary.emergency-gastro.v1": `Mulher, 81 anos. Admitida em hospital secundário com febre, icterícia e dor em hipocôndrio direito. Reconhecimento de colangite com sepse há 18 horas. PA 80/45 mmHg, PAM 58 mmHg, FC 118 bpm, FR 26 irpm, SpO2 93% em cateter nasal 3 L/min, Glasgow 14. Lactato 4,1 mmol/L; creatinina 2,8 mg/dL; bilirrubina total 12,9 mg/dL; plaquetas 92 mil; INR 1,4. Noradrenalina 0,12 mcg/kg/min. TC evidencia dilatação biliar e provável coledocolitíase. Unidade atual não dispõe de CPRE nem drenagem biliar. Solicita-se transferência para controle de foco e suporte intensivo.`,
  "acute-coronary-syndrome.cardiology.v1": `Homem, 62 anos. Dor torácica iniciada há 3 horas, sudorese e náuseas. PA 92/58 mmHg, FC 104 bpm, SpO2 94%. ECG: supradesnivelamento de ST em parede anterior. Troponina elevada. Creatinina 1,2 mg/dL. Unidade sem hemodinâmica. Solicita-se transferência para estratégia de reperfusão.`,
  "acute-ischemic-stroke.neurology.v1": `Mulher, 67 anos. Último momento bem às 07:10. Início súbito de afasia e hemiparesia direita. PA 178/96 mmHg, Glasgow 13, NIHSS 16. Pupilas isocóricas e fotorreagentes. TC de crânio sem hemorragia; angioTC sugere oclusão de grande vaso. Unidade sem neurorradiologia intervencionista.`,
  "polytrauma.trauma-surgery.v1": `Homem, 34 anos. Colisão automobilística de alta energia há 2 horas. PA 78/44 mmHg, FC 132 bpm, FR 30 irpm, SpO2 91%, Glasgow 11. Sangramento ativo em pelve e suspeita de hemorragia intra-abdominal. Lactato 5,2 mmol/L, pH 7,21, INR 1,6. TC: fratura pélvica instável e líquido livre abdominal. Unidade sem centro cirúrgico e banco de sangue com capacidade de protocolo maciço.`,
  "acute-respiratory-failure.critical-care.v1": `Mulher, 49 anos. Insuficiência respiratória reconhecida há 10 horas. PA 105/64 mmHg, FC 116 bpm, FR 34 irpm, SpO2 82% em máscara com reservatório. Evoluiu para ventilação mecânica. Gasometria: pH 7,18, PaO2 52 mmHg em FiO2 100%, lactato 3,0 mmol/L. TC de tórax com infiltrado bilateral difuso. Solicita-se UTI com ventilação avançada e avaliação de elegibilidade para ECMO.`,
  "neurosurgical-emergency.neurosurgery.v1": `Homem, 58 anos. Cefaleia súbita e rebaixamento do nível de consciência iniciados há 4 horas. PA 188/104 mmHg, FC 54 bpm, Glasgow 9. Pupilas anisocóricas, com esquerda pouco reagente; hemiparesia direita. TC de crânio: hematoma intraparenquimatoso com efeito de massa e desvio de linha média. Plaquetas 180 mil, INR 1,1. Unidade sem neurocirurgia de urgência.`,
};

function selectedSchema() {
  return getSchema(elements.schema.value);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { elements.toast.hidden = true; }, 2800);
}

function populateSchemas() {
  for (const schema of SCHEMA_TEMPLATES) {
    const option = document.createElement("option");
    option.value = schema.id;
    option.textContent = `${schema.syndrome} — ${schema.specialty}`;
    elements.schema.append(option);
  }
  renderSchemaMeta();
}

function renderSchemaMeta() {
  const schema = selectedSchema();
  elements.schemaMeta.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = schema.title;
  const purpose = document.createElement("p");
  purpose.textContent = schema.purpose;
  const version = document.createElement("small");
  version.textContent = `Template ${schema.id} · versão ${schema.version}`;
  elements.schemaMeta.append(title, purpose, version);
}

function fieldInput(key, item, schema) {
  const definition = getFieldDefinition(key);
  const wrapper = document.createElement("label");
  wrapper.className = `field-card${definition.type === "textarea" ? " wide" : ""}${item.value === "" ? " missing-field" : ""}`;

  const label = document.createElement("span");
  label.className = "field-label";
  const labelText = document.createElement("span");
  labelText.textContent = `${definition.label}${definition.unit ? ` (${definition.unit})` : ""}`;
  label.append(labelText);
  if (schema.required.includes(key)) {
    const required = document.createElement("span");
    required.className = "required";
    required.textContent = "obrigatório";
    label.append(required);
  }

  const input = document.createElement(definition.type === "textarea" ? "textarea" : "input");
  input.name = key;
  if (input instanceof HTMLInputElement) {
    input.type = definition.type;
    if (definition.step) input.step = definition.step;
  }
  input.value = item.value ?? "";
  input.autocomplete = "off";
  input.addEventListener("input", () => {
    const numeric = definition.type === "number";
    const value = numeric && input.value !== "" ? Number(input.value) : input.value.trim();
    state.fields[key] = {
      ...state.fields[key],
      value,
      origin: "revisão humana",
      confidence: "validado/editado manualmente",
    };
    wrapper.classList.toggle("missing-field", input.value === "");
    refreshOutputs();
  });

  const provenance = document.createElement("span");
  provenance.className = "provenance";
  const origin = document.createElement("strong");
  origin.textContent = `${item.origin}: `;
  provenance.append(origin, document.createTextNode(item.excerpt || item.confidence || "não localizado"));
  wrapper.append(label, input, provenance);
  return wrapper;
}

function renderReview() {
  const schema = selectedSchema();
  const groups = new Map();
  for (const key of schema.fields) {
    const group = getFieldDefinition(key).group;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(key);
  }

  elements.reviewForm.replaceChildren();
  for (const [groupName, keys] of groups) {
    const section = document.createElement("section");
    section.className = "field-group";
    const heading = document.createElement("h3");
    heading.textContent = groupName;
    const grid = document.createElement("div");
    grid.className = "field-grid";
    for (const key of keys) grid.append(fieldInput(key, state.fields[key], schema));
    section.append(heading, grid);
    elements.reviewForm.append(section);
  }
  elements.reviewSection.hidden = false;
}

function currentEnvelope() {
  return buildEnvelope({
    sourceText: state.sourceText,
    schema: selectedSchema(),
    fields: state.fields,
    includeSource: elements.includeSource.checked,
  });
}

function refreshOutputs() {
  if (!state.fields) return;
  const schema = selectedSchema();
  const missing = missingRequiredFields(state.fields, schema);
  elements.reviewStatus.textContent = missing.length ? `${missing.length} campo(s) crítico(s) ausente(s)` : "Template completo · validar conteúdo";
  elements.reviewStatus.classList.toggle("incomplete", missing.length > 0);

  const envelope = currentEnvelope();
  if (state.format === "json") {
    elements.output.value = JSON.stringify(envelope, null, 2);
  } else if (state.format === "schema") {
    elements.output.value = JSON.stringify(buildJsonSchema(schema), null, 2);
  } else {
    elements.output.value = formatRegulatoryText(envelope);
  }
  elements.outputSection.hidden = false;
}

function processNarrative() {
  const raw = elements.narrative.value.trim();
  if (!raw) {
    elements.narrative.focus();
    showToast("Cole uma narrativa ou carregue um caso sintético.");
    return;
  }

  const processed = elements.redact.checked ? redactDirectIdentifiers(raw) : raw;
  if (processed !== raw) {
    elements.narrative.value = processed;
    showToast("Padrões diretos foram redigidos. Revise o texto.");
  }
  state.sourceText = processed;
  state.fields = extractNarrative(processed, selectedSchema());
  renderReview();
  refreshOutputs();
  elements.reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function loadExample() {
  elements.narrative.value = examples[selectedSchema().id] ?? examples[SCHEMA_TEMPLATES[0].id];
  showToast("Caso sintético carregado.");
}

function clearSession() {
  state.fields = null;
  state.sourceText = "";
  elements.narrative.value = "";
  elements.output.value = "";
  elements.reviewForm.replaceChildren();
  elements.reviewSection.hidden = true;
  elements.outputSection.hidden = true;
  showToast("Conteúdo removido da sessão local.");
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(elements.output.value);
    showToast("Saída copiada.");
  } catch {
    elements.output.select();
    document.execCommand("copy");
    showToast("Saída copiada pelo modo compatível.");
  }
}

function downloadOutput() {
  const extension = state.format === "text" ? "txt" : "json";
  const schema = selectedSchema();
  const suffix = state.format === "schema" ? "schema" : state.format;
  const blob = new Blob([elements.output.value], { type: extension === "json" ? "application/json" : "text/plain" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `evam-${schema.id}-${suffix}.${extension}`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

elements.schema.addEventListener("change", () => {
  renderSchemaMeta();
  if (state.fields && elements.narrative.value.trim()) processNarrative();
});
elements.process.addEventListener("click", processNarrative);
elements.example.addEventListener("click", loadExample);
elements.clear.addEventListener("click", clearSession);
elements.copy.addEventListener("click", copyOutput);
elements.download.addEventListener("click", downloadOutput);
elements.includeSource.addEventListener("change", refreshOutputs);
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.format = tab.dataset.format;
    document.querySelectorAll(".tab").forEach((candidate) => {
      const active = candidate === tab;
      candidate.classList.toggle("active", active);
      candidate.setAttribute("aria-selected", String(active));
    });
    refreshOutputs();
  });
});

populateSchemas();

