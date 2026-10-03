import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMA_TEMPLATES, getSchema } from "../schemas.js";
import {
  redactDirectIdentifiers,
  extractNarrative,
  buildEnvelope,
  buildJsonSchema,
  formatRegulatoryText,
} from "../parser.js";

test("redige padrões diretos sem alterar conteúdo clínico adjacente", () => {
  const input = "CPF 123.456.789-10; telefone (11) 99876-5432; lactato 4,1 mmol/L";
  const output = redactDirectIdentifiers(input);
  assert.match(output, /CPF REDIGIDO/);
  assert.match(output, /TELEFONE REDIGIDO/);
  assert.match(output, /lactato 4,1/);
});

test("extrai variáveis básicas do caso-âncora sintético", () => {
  const schema = getSchema("sepsis-biliary.emergency-gastro.v1");
  const text = "Mulher, 81 anos. PA 80/45, PAM 58, FC 118, SpO2 93%. Lactato 4,1 mmol/L; bilirrubina total 12,9 mg/dL. Noradrenalina 0,12 mcg/kg/min.";
  const fields = extractNarrative(text, schema);
  assert.equal(fields.age.value, 81);
  assert.equal(fields.sex.value.toLowerCase(), "mulher");
  assert.equal(fields.map.value, 58);
  assert.equal(fields.lactate.value, 4.1);
  assert.equal(fields.bilirubin.value, 12.9);
  assert.match(fields.vasopressor.value.toLowerCase(), /noradrenalina/);
});

test("envelope declara abstention sem fabricar completude", () => {
  const schema = getSchema("acute-ischemic-stroke.neurology.v1");
  const fields = extractNarrative("Paciente 70 anos, NIHSS 16.", schema);
  const envelope = buildEnvelope({ sourceText: "Paciente 70 anos, NIHSS 16.", schema, fields });
  assert.equal(envelope.status, "INCOMPLETE_REQUIRES_HUMAN_REVIEW");
  assert.ok(envelope.missingCritical.includes("lastKnownWell"));
  assert.equal(envelope.governance.decisionSupportProvided, false);
});

test("cada template produz JSON Schema versionado e fechado", () => {
  for (const schema of SCHEMA_TEMPLATES) {
    const jsonSchema = buildJsonSchema(schema);
    assert.equal(jsonSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(jsonSchema.additionalProperties, false);
    assert.equal(jsonSchema["x-evam"].templateId, schema.id);
    assert.deepEqual(jsonSchema.required, schema.required);
    for (const key of schema.required) assert.ok(jsonSchema.properties[key], `${schema.id}: campo requerido ${key} deve existir`);
  }
});

test("glasgow em componentes grava o total, não o primeiro número", () => {
  const schema = getSchema("neurosurgical-emergency.neurosurgery.v1");
  assert.equal(extractNarrative("Homem, 58 anos. Glasgow 4+5+6=15. Pupilas isocóricas.", schema).gcs.value, 15);
  assert.equal(extractNarrative("Glasgow: 2 + 2 + 5 = 9.", schema).gcs.value, 9);
  assert.equal(extractNarrative("GCS 1+1+2.", schema).gcs.value, 4);
  assert.equal(extractNarrative("Glasgow 8/15.", schema).gcs.value, 8);
  assert.equal(extractNarrative("Glasgow 15 (4+5+6).", schema).gcs.value, 15);
  assert.equal(extractNarrative("ECGLA: 3+4+6=13.", schema).gcs.value, 13);
});

test("menção pupilar fraca não apaga o exame descrito depois", () => {
  const schema = getSchema("neurosurgical-emergency.neurosurgery.v1");
  const hidden = extractNarrative(
    "Reflexo pupilar presente. Pupilas em midríase bilateral arreativa.",
    schema,
  );
  assert.match(hidden.pupilExam.value, /midr[ií]ase/i);
  const pending = extractNarrative(
    "Pupilas a examinar. Pupilas anisocóricas, esquerda arreativa.",
    schema,
  );
  assert.match(pending.pupilExam.value, /anisoc/i);
  const normal = extractNarrative("Pupilas isocóricas e fotorreagentes.", schema);
  assert.match(normal.pupilExam.value, /isocóric/i);
  const bare = extractNarrative("Sem alteração de pupilas.", schema);
  assert.equal(bare.pupilExam.value, "");
});

test("pH urinário não ocupa o campo da gasometria", () => {
  const schema = getSchema("acute-respiratory-failure.critical-care.v1");
  const mixed = extractNarrative(
    "pH 6,0 na urina; gasometria com pH 7,40, PaO2 90, FiO2 21%.",
    schema,
  );
  assert.equal(mixed.ph.value, 7.4);
  assert.equal(extractNarrative("EAS: pH 6,0 na urina.", schema).ph.value, "");
  assert.equal(extractNarrative("Gasometria: pH 7,21, PaO2 52.", schema).ph.value, 7.21);
  assert.equal(extractNarrative("pH 7,22. Urina com pH 5,5.", schema).ph.value, 7.22);
  assert.equal(extractNarrative("pH 7,20, PaO2 60. Urina clara.", schema).ph.value, 7.2);
});

test("resumo formatado explicita campos críticos e governança", () => {
  const schema = SCHEMA_TEMPLATES[0];
  const fields = extractNarrative("Mulher, 81 anos. PAM 58. Lactato 4,1.", schema);
  const envelope = buildEnvelope({ sourceText: "", schema, fields });
  const text = formatRegulatoryText(envelope);
  assert.match(text, /CAMPOS CRÍTICOS AUSENTES/);
  assert.match(text, /validação humana obrigatória/i);
  assert.match(text, /Lactato: 4.1 mmol\/L/);
});

