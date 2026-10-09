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

test("data e hora do registro não entram como sinal vital", () => {
  const acs = getSchema("acute-coronary-syndrome.cardiology.v1");
  const sepsis = getSchema("sepsis-biliary.emergency-gastro.v1");
  const stroke = getSchema("acute-ischemic-stroke.neurology.v1");
  const trauma = getSchema("polytrauma.trauma-surgery.v1");
  const neuro = getSchema("neurosurgical-emergency.neurosurgery.v1");
  const respiratory = getSchema("acute-respiratory-failure.critical-care.v1");

  const stamped = extractNarrative(
    "Homem, 62 anos. FC 03/10 22h: 128 bpm. PA 90/60. SpO2 03/10: 88%. Tax 03/10 08h: 39,2. Glasgow 03/10. Glasgow 8. NIHSS 03/10 07h: 18. FR 03/10. FR 28 irpm. PaO2 03/10: 60 mmHg.",
    acs,
  );
  assert.equal(stamped.heartRate.value, 128);
  assert.equal(extractNarrative("Homem, 62 anos. FC 03/10. PA 90/60.", acs).heartRate.value, "");
  assert.equal(extractNarrative("Homem, 62 anos. FC 22h: 104 bpm.", acs).heartRate.value, 104);
  assert.equal(extractNarrative("Homem, 62 anos. Frequência cardíaca 104 bpm.", acs).heartRate.value, 104);
  assert.equal(extractNarrative("Homem, 62 anos. FC 118.", sepsis).heartRate.value, 118);

  assert.equal(extractNarrative("Mulher, 81 anos. Tax 03/10 08h: 39,2 °C.", sepsis).temperature.value, 39.2);
  assert.equal(extractNarrative("Mulher, 81 anos. Temperatura 36,5.", sepsis).temperature.value, 36.5);
  assert.equal(extractNarrative("Mulher, 81 anos. Tax 03/10.", sepsis).temperature.value, "");

  assert.equal(extractNarrative("Mulher, 67 anos. NIHSS 03/10 07h: 18.", stroke).nihss.value, 18);
  assert.equal(extractNarrative("Paciente 70 anos, NIHSS 16.", stroke).nihss.value, 16);
  assert.equal(extractNarrative("NIHSS 0.", stroke).nihss.value, 0);

  assert.equal(extractNarrative("Homem, 58 anos. Glasgow 03/10. Glasgow 8.", neuro).gcs.value, 8);
  assert.equal(extractNarrative("Glasgow 15/15.", neuro).gcs.value, 15);
  assert.equal(extractNarrative("Glasgow 8/15.", neuro).gcs.value, 8);
  assert.equal(extractNarrative("Glasgow 3.", neuro).gcs.value, 3);
  assert.equal(extractNarrative("ECGLA 14.", neuro).gcs.value, 14);

  assert.equal(extractNarrative("Homem, 34 anos. FR 03/10. FR 28 irpm.", trauma).respiratoryRate.value, 28);
  assert.equal(extractNarrative("FR 26 irpm.", trauma).respiratoryRate.value, 26);
  assert.equal(extractNarrative("FR 12 horas de evolução, sem nova medida.", trauma).respiratoryRate.value, 12);

  assert.equal(extractNarrative("SpO2 03/10: 88%.", respiratory).spo2.value, 88);
  assert.equal(extractNarrative("PaO2 03/10: 60 mmHg. FiO2 100%.", respiratory).pao2.value, 60);
  assert.equal(extractNarrative("PaO2 52 mmHg.", respiratory).pao2.value, 52);
});

test("menção negativa de ECG não oculta o traçado", () => {
  const schema = getSchema("acute-coronary-syndrome.cardiology.v1");

  const later = extractNarrative(
    "Homem, 62 anos. ECG não realizado na origem.\nECG: supradesnivelamento de ST em parede anterior.\nTroponina 450 ng/L.",
    schema,
  );
  assert.match(later.ecg.value, /supradesnivelamento de ST/i);
  assert.doesNotMatch(later.ecg.value, /não realizado/i);
  const envelope = buildEnvelope({
    sourceText: "Homem, 62 anos. ECG não realizado na origem.\nECG: supradesnivelamento de ST em parede anterior.",
    schema,
    fields: later,
  });
  assert.equal(envelope.missingCritical.includes("ecg"), false);
  assert.match(envelope.data.ecg, /supradesnivelamento de ST/i);

  const absent = extractNarrative(
    "Não há ECG da unidade de origem.\nECG: infradesnivelamento de ST em V4-V6.",
    schema,
  );
  assert.match(absent.ecg.value, /infradesnivelamento/i);
  assert.doesNotMatch(absent.ecg.value, /unidade de origem/i);

  const notDone = extractNarrative(
    "Eletrocardiograma não realizado na UPA.\nEletrocardiograma: bloqueio de ramo esquerdo novo.",
    schema,
  );
  assert.match(notDone.ecg.value, /bloqueio de ramo esquerdo/i);
  assert.doesNotMatch(notDone.ecg.value, /não realizado/i);

  const sameLine = extractNarrative(
    "Sem ECG prévio. ECG: supradesnivelamento de ST em V2-V4.",
    schema,
  );
  assert.match(sameLine.ecg.value, /supradesnivelamento de ST/i);
  assert.doesNotMatch(sameLine.ecg.value, /prévio/i);

  assert.match(
    extractNarrative("ECG: supradesnivelamento de ST em parede anterior.", schema).ecg.value,
    /supradesnivelamento de ST/i,
  );
  assert.match(extractNarrative("ECG sem supra de ST.", schema).ecg.value, /sem supra de ST/i);
  assert.equal(extractNarrative("ECG não realizado.", schema).ecg.value, "");
  assert.equal(extractNarrative("Sem ECG.", schema).ecg.value, "");
  assert.match(
    extractNarrative("ECGLA 15. ECG: ritmo sinusal.", schema).ecg.value,
    /ritmo sinusal/i,
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

