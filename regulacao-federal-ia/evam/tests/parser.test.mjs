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

test("resposta motora do Glasgow não ocupa o campo de imagem", () => {
  const schema = getSchema("neurosurgical-emergency.neurosurgery.v1");
  const hidden = extractNarrative(
    "AO 4, RV 5, RM 6.\nTC de crânio: hematoma subdural com desvio de linha média.",
    schema,
  );
  assert.match(hidden.imaging.value, /TC de crânio/i);
  assert.doesNotMatch(hidden.imaging.value, /^RM\s*6/i);

  const sameLine = extractNarrative("Glasgow RM6. TC de crânio com HSD.", schema);
  assert.match(sameLine.imaging.value, /TC de crânio/i);

  const scored = extractNarrative("RM: 5.\nTomografia de crânio sem hemorragia.", schema);
  assert.match(scored.imaging.value, /Tomografia de crânio/i);

  const onlyMotor = extractNarrative("AO 4, RV 5, RM 6.", schema);
  assert.equal(onlyMotor.imaging.value, "");

  const requested = extractNarrative("Solicitada RM.\nTC de crânio: hematoma subdural agudo.", schema);
  assert.match(requested.imaging.value, /TC de crânio/i);
  assert.doesNotMatch(requested.imaging.value, /^RM\.?$/i);

  assert.match(extractNarrative("RM de crânio sem lesão aguda.", schema).imaging.value, /RM de crânio/i);
  assert.match(extractNarrative("RM 3T de encéfalo sem hemorragia.", schema).imaging.value, /RM 3T/i);
  assert.match(extractNarrative("RM 1,5 Tesla de coluna.", schema).imaging.value, /RM 1,5/);
});

test("idade e sexo do acompanhante não substituem o paciente", () => {
  const schema = getSchema("acute-coronary-syndrome.cardiology.v1");
  const fields = extractNarrative("Acompanhante mulher, 40 anos. Paciente homem, 71 anos.", schema);
  assert.equal(fields.age.value, 71);
  assert.equal(fields.sex.value.toLowerCase(), "homem");

  const spouse = extractNarrative("Acompanhante: esposa, 40 anos. Paciente mulher, 66 anos.", schema);
  assert.equal(spouse.age.value, 66);
  assert.equal(spouse.sex.value.toLowerCase(), "mulher");

  const onlyPatient = extractNarrative("Mulher, 81 anos.", schema);
  assert.equal(onlyPatient.age.value, 81);
  assert.equal(onlyPatient.sex.value.toLowerCase(), "mulher");

  assert.equal(extractNarrative("Pai, 45 anos, vítima de colisão.", schema).age.value, 45);
  assert.equal(extractNarrative("Acompanhante saiu. Idade: 71 anos.", schema).age.value, 71);
  assert.equal(extractNarrative("Sexo: masculino. Acompanhante mulher, 40 anos.", schema).sex.value, "masculino");
});

test("laceração em centímetros não entra como lactato", () => {
  const schema = getSchema("polytrauma.trauma-surgery.v1");
  const fields = extractNarrative("Lac 4 cm em couro cabeludo. Lactato 1,8 mmol/L.", schema);
  assert.equal(fields.lactate.value, 1.8);

  const millimeters = extractNarrative("Lac 12 mm no couro cabeludo. Lactato 5,2 mmol/L.", schema);
  assert.equal(millimeters.lactate.value, 5.2);

  assert.equal(extractNarrative("Lac 4,2.", schema).lactate.value, 4.2);
  assert.equal(extractNarrative("Lactato 4,1 mmol/L.", schema).lactate.value, 4.1);
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

