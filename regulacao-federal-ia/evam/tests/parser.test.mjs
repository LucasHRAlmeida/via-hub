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
  assert.equal(fields.sbp.value, 80);
  assert.equal(fields.dbp.value, 45);
  assert.equal(fields.map.value, 58);
  assert.equal(fields.lactate.value, 4.1);
  assert.equal(fields.bilirubin.value, 12.9);
  assert.match(fields.vasopressor.value.toLowerCase(), /noradrenalina/);
});

test("data do pronto atendimento não vira pressão arterial", () => {
  const schema = getSchema("acute-coronary-syndrome.cardiology.v1");
  const dated = extractNarrative(
    "Homem, 62 anos. Entrada no PA 03/10. Dor torácica. PA 92/58 mmHg, FC 104, SpO2 94%.",
    schema,
  );
  assert.equal(dated.sbp.value, 92);
  assert.equal(dated.dbp.value, 58);

  const withYear = extractNarrative("Admitido no PA 12/10/2026. PA 80/45, FC 110.", schema);
  assert.equal(withYear.sbp.value, 80);
  assert.equal(withYear.dbp.value, 45);

  const dateOnly = extractNarrative("Veio ao PA 12/10/2026. Sem registro de pressão arterial.", schema);
  assert.equal(dateOnly.sbp.value, "");
  assert.equal(dateOnly.dbp.value, "");

  const wide = extractNarrative("pressão arterial 178/96 mmHg. PA 100 x 70 após analgesia.", schema);
  assert.equal(wide.sbp.value, 178);
  assert.equal(wide.dbp.value, 96);

  const shock = extractNarrative("PA 70/40 em choque.", schema);
  assert.equal(shock.sbp.value, 70);
  assert.equal(shock.dbp.value, 40);
});

test("relação PaO2/FiO2 não é gravada como FiO2", () => {
  const schema = getSchema("acute-respiratory-failure.critical-care.v1");
  const mixed = extractNarrative(
    "PaO2/FiO2 180. Gasometria: pH 7,18, PaO2 52 mmHg em FiO2 100%.",
    schema,
  );
  assert.equal(mixed.fio2.value, 100);
  assert.equal(mixed.pao2.value, 52);

  assert.equal(extractNarrative("Relação PaO2/FiO2: 250.", schema).fio2.value, "");
  assert.equal(extractNarrative("PO2 / FiO2 150. FiO2 60%.", schema).fio2.value, 60);
  assert.equal(extractNarrative("FiO2 50%.", schema).fio2.value, 50);
  assert.equal(extractNarrative("FiO2 100% (PaO2/FiO2 180).", schema).fio2.value, 100);
});

test("TCE e TCLE não ocultam a tomografia", () => {
  const trauma = getSchema("polytrauma.trauma-surgery.v1");
  const tce = extractNarrative(
    "Homem, 34 anos. Colisão há 2 horas.\nTCE grave.\nTC de crânio: hematoma subdural com desvio de linha média.",
    trauma,
  );
  assert.match(tce.imaging.value, /hematoma subdural/i);
  assert.doesNotMatch(tce.imaging.value, /^TCE\b/);

  const sameLine = extractNarrative("TCE grave após colisão. TC de crânio: hematoma subdural.", trauma);
  assert.match(sameLine.imaging.value, /^TC de crânio/i);

  const stroke = getSchema("acute-ischemic-stroke.neurology.v1");
  const tcle = extractNarrative("TCLE assinado pela família.\nTC de crânio sem hemorragia.", stroke);
  assert.match(tcle.imaging.value, /sem hemorragia/i);
  assert.doesNotMatch(tcle.imaging.value, /TCLE/);

  const sepsis = getSchema("sepsis-biliary.emergency-gastro.v1");
  assert.match(extractNarrative("TC evidencia dilatação biliar.", sepsis).imaging.value, /dilatação biliar/i);
  assert.match(extractNarrative("Tomografia de abdome com líquido livre.", sepsis).imaging.value, /líquido livre/i);
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

