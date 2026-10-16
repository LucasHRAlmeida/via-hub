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

test("SpO2 não grava fluxo de oxigênio como saturação", () => {
  const schema = getSchema("acute-respiratory-failure.critical-care.v1");
  assert.equal(extractNarrative("SpO2 93% em cateter nasal 3 L/min.", schema).spo2.value, 93);
  assert.equal(extractNarrative("Saturação de O2 88% em máscara com reservatório 10 L/min.", schema).spo2.value, 88);
  assert.equal(extractNarrative("Saturação de O2 3 L/min.", schema).spo2.value, "");
  assert.equal(extractNarrative("Saturação de O2 10 L/min. SpO2 96%.", schema).spo2.value, 96);
  assert.equal(extractNarrative("Saturação de O2 15 L/min.", schema).spo2.value, "");
  assert.equal(extractNarrative("Saturação de O2: 2 litros/min. SpO2 96%.", schema).spo2.value, 96);
  assert.equal(extractNarrative("Sat 97%.", schema).spo2.value, 97);
});

test("troponina seriada e negada não grava a primeira leitura invertida", () => {
  const schema = getSchema("acute-coronary-syndrome.cardiology.v1");
  const serial = extractNarrative(
    "Homem, 62 anos. Troponina negativa na admissão. Troponina de 3 horas: 420 ng/L.",
    schema,
  );
  assert.match(serial.troponin.value, /420/);
  assert.doesNotMatch(serial.troponin.value, /negativa/i);

  const rising = extractNarrative("Troponina 18 ng/L. Controle troponina 350 ng/L.", schema);
  assert.match(rising.troponin.value, /350/);
  assert.doesNotMatch(rising.troponin.value, /\b18\b/);

  const second = extractNarrative("1ª troponina negativa, 2ª troponina positiva.", schema);
  assert.match(second.troponin.value, /positiva/i);
  assert.doesNotMatch(second.troponin.value, /negativa/i);

  const negated = extractNarrative("Sem troponina elevada.", schema);
  assert.match(negated.troponin.value, /\bsem\b/i);
  assert.doesNotMatch(negated.troponin.value, /^troponina elevada$/i);

  assert.match(extractNarrative("Troponina não elevada.", schema).troponin.value, /não elevada/i);
  assert.match(extractNarrative("Troponina elevada.", schema).troponin.value, /elevada/i);
  assert.match(extractNarrative("Trop positiva.", schema).troponin.value, /positiva/i);
  assert.match(extractNarrative("Troponina: negativa.", schema).troponin.value, /negativa/i);

  // Decimal com ponto e valor ligado só à menção (não herda BNP/CK-MB).
  assert.match(extractNarrative("Troponina 0.35 ng/mL.", schema).troponin.value, /0\.35/);
  assert.match(extractNarrative("Troponina negativa, BNP 420 ng/L.", schema).troponin.value, /negativa/i);
  assert.doesNotMatch(extractNarrative("Troponina negativa, BNP 420 ng/L.", schema).troponin.value, /420/);
  assert.match(extractNarrative("Troponina normal, CK-MB 35 ng/L.", schema).troponin.value, /normal/i);
  assert.doesNotMatch(extractNarrative("Troponina normal, CK-MB 35 ng/L.", schema).troponin.value, /35/);
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

test("menção negativa de exame não oculta a imagem feita", () => {
  const stroke = getSchema("acute-ischemic-stroke.neurology.v1");
  const biliary = getSchema("sepsis-biliary.emergency-gastro.v1");

  const mri = extractNarrative(
    "Sem TC prévia.\nRM de crânio com oclusão de M1 e mismatch.",
    stroke,
  );
  assert.match(mri.imaging.value, /oclusão de M1/i);
  assert.doesNotMatch(mri.imaging.value, /TC prévia/i);
  const mriEnvelope = buildEnvelope({
    sourceText: "Sem TC prévia.\nRM de crânio com oclusão de M1 e mismatch.",
    schema: stroke,
    fields: mri,
  });
  assert.equal(mriEnvelope.missingCritical.includes("imaging"), false);

  const absentCt = extractNarrative("Não há TC.\nRM de crânio com isquemia em ACM.", stroke);
  assert.match(absentCt.imaging.value, /isquemia em ACM/i);
  assert.doesNotMatch(absentCt.imaging.value, /\bTC\b/);

  const notPerformed = extractNarrative(
    "Não realizou TC na origem.\nRM de crânio com oclusão de M1.",
    stroke,
  );
  assert.match(notPerformed.imaging.value, /oclusão de M1/i);
  assert.doesNotMatch(notPerformed.imaging.value, /origem/i);

  const notDoneSentence = extractNarrative(
    "Não foi feita TC.\nUSG com cálculo em colédoco.",
    biliary,
  );
  assert.match(notDoneSentence.imaging.value, /cálculo em colédoco/i);

  const unavailable = extractNarrative(
    "RM não disponível.\nTC de crânio: hematoma subdural.",
    stroke,
  );
  assert.match(unavailable.imaging.value, /hematoma subdural/i);
  assert.doesNotMatch(unavailable.imaging.value, /não disponível/i);

  const notDone = extractNarrative(
    "TC não realizada.\nUltrassom de abdome com líquido livre e colédoco de 14 mm.",
    biliary,
  );
  assert.match(notDone.imaging.value, /colédoco de 14 mm/i);
  assert.doesNotMatch(notDone.imaging.value, /não realizada/i);

  const headed = extractNarrative(
    "TC: não realizada.\nUltrassom de abdome com líquido livre.",
    biliary,
  );
  assert.match(headed.imaging.value, /líquido livre/i);

  const sameLine = extractNarrative("Sem TC. Ultrassom com cálculo em colédoco.", biliary);
  assert.match(sameLine.imaging.value, /cálculo em colédoco/i);
  assert.doesNotMatch(sameLine.imaging.value, /^TC\b/);

  assert.equal(extractNarrative("Sem TC prévia.", stroke).imaging.value, "");
  assert.equal(extractNarrative("TC não realizada.", biliary).imaging.value, "");

  assert.match(extractNarrative("TC de crânio sem hemorragia.", stroke).imaging.value, /sem hemorragia/i);
  assert.match(extractNarrative("TC sem contraste, sem hemorragia.", stroke).imaging.value, /sem contraste/i);
  assert.match(extractNarrative("sem contraste. TC de crânio sem hemorragia.", stroke).imaging.value, /sem hemorragia/i);
  assert.match(extractNarrative("TC evidencia dilatação biliar.", biliary).imaging.value, /dilatação biliar/i);
  assert.match(extractNarrative("AngioTC sugere oclusão de M1.", stroke).imaging.value, /oclusão de M1/i);
  assert.match(extractNarrative("Angiografia coronariana com oclusão de DA.", getSchema("acute-coronary-syndrome.cardiology.v1")).imaging.value, /oclusão de DA/i);
  assert.match(extractNarrative("ColangioRM com cálculo em colédoco.", biliary).imaging.value, /cálculo em colédoco/i);
  assert.match(extractNarrative("USG com cálculo em colédoco.", biliary).imaging.value, /cálculo em colédoco/i);
  assert.match(extractNarrative("Tomografia de abdome com líquido livre.", biliary).imaging.value, /líquido livre/i);
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

