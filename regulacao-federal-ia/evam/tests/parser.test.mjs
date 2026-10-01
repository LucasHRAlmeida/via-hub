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

test("idade não herda duração de comorbidade", () => {
  const schema = getSchema("sepsis-biliary.emergency-gastro.v1");
  const cases = [
    ["Hipertenso há 15 anos. Homem de 62 anos.", 62],
    ["DM há 20 anos. Mulher de 81 anos.", 81],
    ["HAS há cerca de 15 anos. 62 anos, sexo masculino.", 62],
    ["Paciente de 70 anos. DM há 10 anos.", 70],
    ["Mulher, 81 anos.", 81],
  ];
  for (const [text, expected] of cases) {
    assert.equal(extractNarrative(text, schema).age.value, expected, text);
  }
  assert.equal(extractNarrative("Hipertenso há 15 anos.", schema).age.value, "");
});

test("clearance e volume de Ringer não entram como lab sérico", () => {
  const schema = getSchema("sepsis-biliary.emergency-gastro.v1");
  const both = extractNarrative(
    "Clearance de creatinina 85 mL/min. Creatinina sérica 1,4 mg/dL. Ringer lactato 500 mL. Lactato 2,1 mmol/L.",
    schema,
  );
  assert.equal(both.creatinine.value, 1.4);
  assert.equal(both.lactate.value, 2.1);
  const onlyVolume = extractNarrative("Depuração de creatinina 90 ml/min. Lactato 500 mL.", schema);
  assert.equal(onlyVolume.creatinine.value, "");
  assert.equal(onlyVolume.lactate.value, "");
  assert.equal(extractNarrative("Creatinina 2,8 mg/dL. Lactato 4,1 mmol/L.", schema).creatinine.value, 2.8);
});

test("negação na mesma oração não vira achado presente", () => {
  const sepsis = getSchema("sepsis-biliary.emergency-gastro.v1");
  const neuro = getSchema("neurosurgical-emergency.neurosurgery.v1");
  const resp = getSchema("acute-respiratory-failure.critical-care.v1");
  const trauma = getSchema("polytrauma.trauma-surgery.v1");

  assert.equal(extractNarrative("Paciente estável, sem noradrenalina. PA 110/70.", sepsis).vasopressor.value, "");
  assert.match(
    extractNarrative("sem noradrenalina prévia; agora noradrenalina 0,12 mcg/kg/min.", sepsis).vasopressor.value,
    /noradrenalina 0,12/i,
  );
  assert.match(
    extractNarrative("Paciente não diabético. Noradrenalina 0,08 mcg/kg/min.", sepsis).vasopressor.value,
    /noradrenalina 0,08/i,
  );

  assert.equal(extractNarrative("Sem ventilação mecânica. SpO2 96% em ar ambiente.", resp).oxygenSupport.value, "");
  assert.match(
    extractNarrative("SpO2 93% em cateter nasal 3 L/min.", resp).oxygenSupport.value,
    /cateter nasal 3 L\/min/i,
  );
  assert.match(
    extractNarrative("Evoluiu para ventilação mecânica.", resp).oxygenSupport.value,
    /ventilação mecânica/i,
  );

  assert.equal(extractNarrative("Sem déficit focal. Glasgow 15.", neuro).focalDeficit.value, "");
  assert.match(
    extractNarrative("Sem hemiparesia. Afasia de expressão.", neuro).focalDeficit.value,
    /afasia de expressão/i,
  );
  assert.match(
    extractNarrative("Afasia e hemiparesia direita.", neuro).focalDeficit.value,
    /afasia e hemiparesia direita/i,
  );

  assert.match(
    extractNarrative("Negou queda. Colisão automobilística de alta energia.", trauma).injuryMechanism.value,
    /colisão automobilística/i,
  );
  assert.match(
    extractNarrative("Queda da própria altura.", trauma).injuryMechanism.value,
    /queda da própria altura/i,
  );
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

test("resumo formatado explicita campos críticos e governança", () => {
  const schema = SCHEMA_TEMPLATES[0];
  const fields = extractNarrative("Mulher, 81 anos. PAM 58. Lactato 4,1.", schema);
  const envelope = buildEnvelope({ sourceText: "", schema, fields });
  const text = formatRegulatoryText(envelope);
  assert.match(text, /CAMPOS CRÍTICOS AUSENTES/);
  assert.match(text, /validação humana obrigatória/i);
  assert.match(text, /Lactato: 4.1 mmol\/L/);
});

