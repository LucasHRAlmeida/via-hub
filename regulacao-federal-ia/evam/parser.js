import { EVAM_VERSION, getFieldDefinition, getFieldMaxAgeHours } from "./schemas.js";

const number = (value) => {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const excerptAround = (text, index, length) => {
  const start = Math.max(0, index - 38);
  const end = Math.min(text.length, index + length + 58);
  return clean(`${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`);
};

const matchOne = (text, expressions, valueGroup = 1, transform = clean) => {
  for (const expression of expressions) {
    expression.lastIndex = 0;
    const match = expression.exec(text);
    if (!match) continue;
    const value = transform(match[valueGroup], match);
    if (value === null || value === "") continue;
    return {
      value,
      excerpt: excerptAround(text, match.index, match[0].length),
      confidence: "heurística",
    };
  }
  return null;
};

const yesNoText = (positive, negative = null) => (text) => {
  const positiveResult = matchOne(text, positive, 0, clean);
  if (positiveResult) return { ...positiveResult, value: "Sim — " + positiveResult.value };
  if (negative) {
    const negativeResult = matchOne(text, negative, 0, clean);
    if (negativeResult) return { ...negativeResult, value: "Não — " + negativeResult.value };
  }
  return null;
};


/**
 * Parse observedAt from ISO-8601 or epoch milliseconds/seconds string.
 * Returns Date or null. Transparent heuristic — does not invent timestamps.
 */
export function parseObservedAt(value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const raw = String(value).trim();
  if (/^\d{10,13}$/.test(raw)) {
    const n = Number(raw);
    const ms = raw.length === 10 ? n * 1000 : n;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Freshness bands (Pilot A):
 * - fresh: age < 50% of maxAgeHours
 * - stale: age >= 50% and < maxAgeHours
 * - expired: age >= maxAgeHours
 * Returns null when observedAt or maxAgeHours is unavailable.
 */
export function computeFreshness(observedAt, maxAgeHours, now = new Date()) {
  const observed = parseObservedAt(observedAt);
  const maxAge = Number(maxAgeHours);
  if (!observed || !Number.isFinite(maxAge) || maxAge <= 0) return null;
  const ageMs = now.getTime() - observed.getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) return null;
  const ageHours = ageMs / 3_600_000;
  if (ageHours >= maxAge) return "expired";
  if (ageHours >= maxAge * 0.5) return "stale";
  return "fresh";
}

export function deriveValidUntil(observedAt, maxAgeHours) {
  const observed = parseObservedAt(observedAt);
  const maxAge = Number(maxAgeHours);
  if (!observed || !Number.isFinite(maxAge) || maxAge <= 0) return null;
  return new Date(observed.getTime() + maxAge * 3_600_000).toISOString();
}

/**
 * Attach TTL provenance when the field has maxAgeHours and an observedAt
 * (explicit on the field, or derived from hoursSinceRecognition for lab/vital fields).
 * Heuristic: if hoursSinceRecognition is known and the field has a value, treat
 * "estado atual / laboratório" as observed roughly that many hours ago.
 */
export function enrichFieldFreshness(fields, { now = new Date() } = {}) {
  const hours = Number(fields.hoursSinceRecognition?.value);
  const derivedObserved = Number.isFinite(hours) && hours >= 0
    ? new Date(now.getTime() - hours * 3_600_000).toISOString()
    : null;

  for (const [key, item] of Object.entries(fields)) {
    if (!item || item.value === "" || item.value === null || typeof item.value === "undefined") continue;
    const maxAge = getFieldMaxAgeHours(key);
    if (maxAge === null) continue;

    const observedAt = item.observedAt || derivedObserved;
    if (!observedAt) continue;

    const validUntil = item.validUntil || deriveValidUntil(observedAt, maxAge);
    const freshness = computeFreshness(observedAt, maxAge, now);
    fields[key] = {
      ...item,
      observedAt: parseObservedAt(observedAt)?.toISOString?.() ?? String(observedAt),
      validUntil,
      freshness,
      maxAgeHours: maxAge,
    };
  }
  return fields;
}

/**
 * Troponina seriada: a última dosagem (ou a menção positiva) prevalece sobre
 * uma negativa anterior. "sem/não/negou" imediatamente antes do termo não vira
 * resultado elevado. Só lê o valor sintaticamente ligado à menção (não varre
 * outros analitos na mesma oração). Ponto/vírgula entre dígitos não fecha o trecho.
 */
function extractTroponin(text) {
  // Cauda: permite [.,] só entre dígitos; vírgula/ponto de oração encerram.
  const expression = /\b(?:(sem|n[aã]o|negou(?:\s+que)?)\s+)?(?:\d+\s*[ªa]\s+)?(troponina|trop)\b((?:[^\n.,;]|[.,](?=\d)){0,40})/giu;
  let best = null;

  for (const match of text.matchAll(expression)) {
    const parsed = parseTroponinMention(match[1] || "", match[2], match[3] || "");
    if (!parsed) continue;
    if (!best || parsed.rank > best.rank || (parsed.rank === best.rank && match.index > best.index)) {
      best = { ...parsed, index: match.index, length: match[0].length };
    }
  }

  if (!best) return null;
  return {
    value: best.value,
    excerpt: excerptAround(text, best.index, best.length),
    confidence: "heurística",
  };
}

function parseTroponinMention(negation, keyword, tail) {
  // "troponina de 3 horas: 420 ng/L" — o valor vem após o marcador temporal.
  const rest = String(tail).replace(/^(?:\s+de\s+\d+(?:[.,]\d+)?\s*horas?)?/iu, "");
  const unitOf = (raw) => (/m/i.test(raw) ? "ng/mL" : "ng/L");
  const quantified = rest.match(/^\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(ng\s*\/?\s*m?l)\b/iu);
  const qualitative = rest.match(/^\s*[:=]?\s*(positiva|negativa|normal|elevada|n[aã]o\s+elevada)\b/iu);
  const bareNumber = rest.match(/^\s*[:=]?\s*(\d+(?:[.,]\d+)?)\b/iu);

  if (negation) {
    if (quantified) {
      return { rank: 0, value: clean(`${negation} ${keyword} ${quantified[1]} ${unitOf(quantified[2])}`) };
    }
    if (qualitative) {
      return { rank: 0, value: clean(`${negation} ${keyword} ${qualitative[1]}`) };
    }
    return { rank: 0, value: clean(`${negation} ${keyword}`) };
  }

  if (quantified) {
    return { rank: 3, value: clean(`${keyword} ${quantified[1]} ${unitOf(quantified[2])}`) };
  }

  if (qualitative) {
    const token = qualitative[1];
    const rank = /^(positiva|elevada)/iu.test(token) ? 2 : 1;
    return { rank, value: clean(`${keyword} ${token}`) };
  }

  if (bareNumber) {
    return { rank: 3, value: clean(`${keyword} ${bareNumber[1]}`) };
  }

  return null;
}

const EXTRACTORS = Object.freeze({
  age: (text) => matchOne(text, [
    /\b(?:idade|paciente(?:\s+com)?|mulher|homem)\s*[:=,-]?\s*(\d{1,3})\s*(?:anos?|a\b)/iu,
    /\b(\d{1,3})\s*anos?\b/iu,
  ], 1, number),
  sex: (text) => matchOne(text, [
    /\bsexo\s*[:=]\s*(feminino|masculino|fem\.?|masc\.?|f|m)\b/iu,
    /\b(mulher|homem)\s*[,;:-]?\s*(?:de\s+)?\d{1,3}\s*anos?\b/iu,
  ]),
  hoursSinceRecognition: (text) => matchOne(text, [
    /\b(?:há|ha|desde|reconhecid[ao]\s+há)\s*(\d+(?:[.,]\d+)?)\s*(?:h|horas?)\b/iu,
    /\btempo\s*(?:desde\s+reconhecimento)?\s*[:=]\s*(\d+(?:[.,]\d+)?)\s*(?:h|horas?)?\b/iu,
  ], 1, number),
  sbp: (text) => matchOne(text, [
    /\b(?:pa|press[aã]o\s+arterial)\s*[:=]?\s*(\d{2,3})\s*[x/]\s*\d{2,3}\b/iu,
    /\bpas\s*[:=]?\s*(\d{2,3})\b/iu,
  ], 1, number),
  dbp: (text) => matchOne(text, [
    /\b(?:pa|press[aã]o\s+arterial)\s*[:=]?\s*\d{2,3}\s*[x/]\s*(\d{2,3})\b/iu,
    /\bpad\s*[:=]?\s*(\d{2,3})\b/iu,
  ], 1, number),
  map: (text) => matchOne(text, [
    /\b(?:pam|press[aã]o\s+arterial\s+m[eé]dia)\s*[:=]?\s*(\d{2,3})\b/iu,
  ], 1, number),
  heartRate: (text) => matchOne(text, [
    /\b(?:fc|frequ[eê]ncia\s+card[ií]aca)\s*[:=]?\s*(\d{2,3})\s*(?:bpm)?\b/iu,
  ], 1, number),
  respiratoryRate: (text) => matchOne(text, [
    /\b(?:fr|frequ[eê]ncia\s+respirat[oó]ria)\s*[:=]?\s*(\d{1,2})\s*(?:irpm|rpm)?\b/iu,
  ], 1, number),
  spo2: (text) => matchOne(text, [
    // Fluxo (L, L/min, litros, lpm) não é saturação. (?!\d) evita backtrack
    // de "10 L/min" para SpO₂=1.
    /\b(?:spo2|sat(?:ura[cç][aã]o)?(?:\s+de\s+o2)?)\s*[:=]?\s*(\d{1,3})(?!\d)(?!\s*l(?:pm|itros?)?\b)\s*%?/iu,
  ], 1, number),
  temperature: (text) => matchOne(text, [
    /\b(?:temp(?:eratura)?|tax)\s*[:=]?\s*(\d{2}(?:[.,]\d)?)\s*(?:°?c)?\b/iu,
  ], 1, number),
  gcs: (text) => matchOne(text, [
    /\b(?:glasgow|ecgla|gcs)\s*[:=]?\s*(\d{1,2})(?:\s*\/\s*15)?\b/iu,
  ], 1, number),
  oxygenSupport: (text) => matchOne(text, [
    /\b((?:cateter\s+nasal|m[aá]scara\s+(?:com\s+)?reservat[oó]rio|venturi|alto\s+fluxo|cnaf|vni|cpap|bipap|ventila[cç][aã]o\s+mec[aâ]nica|i\.?o\.?t\.?)[^\n.;]{0,80})/iu,
  ]),
  vasopressor: (text) => matchOne(text, [
    /\b((?:noradrenalina|norepinefrina|vasopressina|adrenalina|epinefrina|dopamina)[^\n.;]{0,80})/iu,
  ]),
  lactate: (text) => matchOne(text, [
    /\b(?:lactato|lac)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:mmol\/?l)?\b/iu,
  ], 1, number),
  creatinine: (text) => matchOne(text, [
    /\b(?:creatinina|cr)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:mg\/?dl)?\b/iu,
  ], 1, number),
  bilirubin: (text) => matchOne(text, [
    /\b(?:bilirrubina\s+total|bt)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:mg\/?dl)?\b/iu,
  ], 1, number),
  platelets: (text) => matchOne(text, [
    /\b(?:plaquetas?|plaq)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:mil|k|\/mm3|\/mm³)?\b/iu,
  ], 1, number),
  inr: (text) => matchOne(text, [
    /\binr\s*[:=]?\s*(\d+(?:[.,]\d+)?)\b/iu,
  ], 1, number),
  troponin: extractTroponin,
  ph: (text) => matchOne(text, [
    /\bph\s*[:=]?\s*(\d[.,]\d{1,3})\b/iu,
  ], 1, number),
  pao2: (text) => matchOne(text, [
    /\bpao2\s*[:=]?\s*(\d{2,3})\s*(?:mmhg)?\b/iu,
  ], 1, number),
  fio2: (text) => matchOne(text, [
    /\bfio2\s*[:=]?\s*(\d{1,3})\s*%?/iu,
  ], 1, number),
  nihss: (text) => matchOne(text, [
    /\bnihss\s*[:=]?\s*(\d{1,2})\b/iu,
  ], 1, number),
  pupilExam: (text) => matchOne(text, [
    /\b(pupilas?[^\n.;]{0,90})/iu,
  ]),
  focalDeficit: (text) => matchOne(text, [
    /\b((?:hemiparesia|hemiplegia|afasia|disartria|desvio\s+do\s+olhar|d[eé]ficit\s+focal)[^\n.;]{0,90})/iu,
  ]),
  ecg: (text) => matchOne(text, [
    /\b(ecg[^\n]{0,180})/iu,
    /\b(eletrocardiograma[^\n]{0,180})/iu,
  ]),
  imaging: (text) => matchOne(text, [
    /\b((?:tc|tomografia|rm|resson[aâ]ncia|ultrassom|usg|colangio(?:rm)?|angio(?:tc)?)[^\n]{0,220})/iu,
  ]),
  injuryMechanism: (text) => matchOne(text, [
    /\b((?:colis[aã]o|capotamento|atropelamento|queda|ferimento\s+por|trauma\s+(?:contuso|penetrante))[^\n.;]{0,120})/iu,
  ]),
  hemorrhage: yesNoText([
    // "negado/negada" depois do achado, ou "nega/negou" imediatamente antes, não é hemorragia presente.
    /(?<!\b(?:nega(?:-se)?|negou)\s+)\b(?:hemorragia|sangramento)\s+(?:ativo|importante|maci[cç]o|n[aã]o\s+controlado)\b(?!\s*,?\s*negad[oa]\b)/iu,
    /(?<!\b(?:nega(?:-se)?|negou)\s+)\bchoque\s+hemorr[aá]gico\b(?!\s*,?\s*negad[oa]\b)/iu,
  ], [
    /\bsem\s+(?:hemorragia|sangramento)\s+ativ[oa]\b/iu,
    /\b(?:nega(?:-se)?|negou)\s+(?:hemorragia|sangramento)\s+(?:ativo|importante|maci[cç]o)\b/iu,
    /\b(?:hemorragia|sangramento)\s+(?:ativo|importante|maci[cç]o|n[aã]o\s+controlado)\s*,?\s*negad[oa]\b/iu,
    /\b(?:nega(?:-se)?|negou)\s+choque\s+hemorr[aá]gico\b/iu,
    /\bchoque\s+hemorr[aá]gico\s*,?\s*negad[oa]\b/iu,
  ]),
});

export function redactDirectIdentifiers(text) {
  return String(text ?? "")
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF REDIGIDO]")
    .replace(/\b\d{15}\b/g, "[CNS REDIGIDO]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, "[E-MAIL REDIGIDO]")
    .replace(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}\b/g, "[TELEFONE REDIGIDO]");
}

export function extractNarrative(text, schema) {
  const source = String(text ?? "");
  const fields = {};

  for (const key of schema.fields) {
    const extracted = EXTRACTORS[key]?.(source) ?? null;
    fields[key] = extracted
      ? { ...extracted, origin: "extração automática" }
      : { value: "", excerpt: "", confidence: "não localizado", origin: "revisão humana" };
  }

  if (!fields.interventionNeeded.value) {
    fields.interventionNeeded = {
      value: schema.defaultIntervention,
      excerpt: "",
      confidence: "template",
      origin: "template selecionado",
    };
  }

  if (!fields.capabilityNeeded.value) {
    fields.capabilityNeeded = {
      value: schema.defaultCapability,
      excerpt: "",
      confidence: "template",
      origin: "template selecionado",
    };
  }

  enrichFieldFreshness(fields);
  return fields;
}

export function missingRequiredFields(fields, schema) {
  return schema.required.filter((key) => {
    const value = fields[key]?.value;
    return value === "" || value === null || typeof value === "undefined";
  });
}

export function buildEnvelope({ sourceText, schema, fields, includeSource = false }) {
  const missing = missingRequiredFields(fields, schema);
  const data = {};
  const provenance = {};

  // Ensure TTL/freshness is computed even when fields were edited in the UI.
  enrichFieldFreshness(fields);

  for (const key of schema.fields) {
    const item = fields[key] ?? { value: "" };
    data[key] = item.value === "" ? null : item.value;
    const entry = {
      origin: item.origin ?? "revisão humana",
      confidence: item.confidence ?? "não informado",
      excerpt: item.excerpt || null,
    };
    // Pilot A TTL: critical clinical fields may carry observedAt / validUntil / freshness.
    if (item.observedAt) entry.observedAt = item.observedAt;
    if (item.validUntil) entry.validUntil = item.validUntil;
    if (item.freshness) entry.freshness = item.freshness;
    if (item.maxAgeHours != null) entry.maxAgeHours = item.maxAgeHours;
    provenance[key] = entry;
  }

  return {
    resourceType: "EVAMRegulationEnvelope",
    evamVersion: EVAM_VERSION,
    schema: {
      id: schema.id,
      version: schema.version,
      syndrome: schema.syndrome,
      specialty: schema.specialty,
    },
    generatedAt: new Date().toISOString(),
    status: missing.length ? "INCOMPLETE_REQUIRES_HUMAN_REVIEW" : "STRUCTURED_REQUIRES_HUMAN_VALIDATION",
    data,
    missingCritical: missing,
    provenance,
    sourceNarrative: includeSource ? sourceText : undefined,
    governance: {
      syntheticOrDeidentifiedOnly: true,
      automatedExtractionIsDiagnostic: false,
      humanValidationRequired: true,
      decisionSupportProvided: false,
    },
  };
}

export function buildJsonSchema(schema) {
  const properties = {};
  for (const key of schema.fields) {
    const field = getFieldDefinition(key);
    const property = {
      title: field.label,
      type: field.type === "number" ? ["number", "null"] : ["string", "null"],
    };
    if (field.unit) property["x-unit"] = field.unit;
    properties[key] = property;
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://iniciativa-via.com/via-hub/regulacao-federal-ia/evam/schemas/${schema.id}.schema.json`,
    title: schema.title,
    description: schema.purpose,
    type: "object",
    additionalProperties: false,
    properties,
    required: schema.required,
    "x-evam": {
      templateId: schema.id,
      version: schema.version,
      syndrome: schema.syndrome,
      specialty: schema.specialty,
      humanValidationRequired: true,
    },
  };
}

export function formatRegulatoryText(envelope) {
  const lines = [
    "EVAM — RESUMO REGULATÓRIO ESTRUTURADO",
    `Template: ${envelope.schema.syndrome} | ${envelope.schema.specialty}`,
    `Versão: ${envelope.schema.id}@${envelope.schema.version}`,
    `Status: ${envelope.status}`,
    "",
  ];

  let activeGroup = "";
  for (const [key, value] of Object.entries(envelope.data)) {
    if (value === null || value === "") continue;
    const field = getFieldDefinition(key);
    if (field.group !== activeGroup) {
      activeGroup = field.group;
      lines.push(activeGroup.toUpperCase());
    }
    const fresh = envelope.provenance?.[key]?.freshness;
    const freshNote = fresh ? ` [${fresh}]` : "";
    lines.push(`- ${field.label}: ${value}${field.unit ? ` ${field.unit}` : ""}${freshNote}`);
  }

  lines.push("", "CAMPOS CRÍTICOS AUSENTES");
  if (envelope.missingCritical.length) {
    for (const key of envelope.missingCritical) {
      lines.push(`- ${getFieldDefinition(key).label}`);
    }
  } else {
    lines.push("- Nenhum campo obrigatório do template está vazio.");
  }

  lines.push(
    "",
    "GOVERNANÇA",
    "- Extração heurística; validação humana obrigatória.",
    "- O conversor não diagnostica, prioriza, recomenda destino ou substitui regulação clínica.",
    "- Usar somente casos sintéticos ou adequadamente desidentificados nesta versão pública.",
  );

  return lines.join("\n");
}
