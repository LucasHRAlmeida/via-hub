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

test("queda de exame não vira mecanismo de trauma", () => {
  const schema = getSchema("polytrauma.trauma-surgery.v1");
  const mechanism = (text) => extractNarrative(text, schema).injuryMechanism.value;

  assert.match(mechanism("Queda do hematócrito de 12 para 7. Colisão carro contra poste."), /colis[aã]o carro contra poste/i);
  assert.doesNotMatch(mechanism("Queda do hematócrito de 12 para 7. Colisão carro contra poste."), /hemat[oó]crito/i);
  assert.match(mechanism("Queda da Hb de 3 g. Colisão frontal."), /colis[aã]o frontal/i);
  assert.match(mechanism("Queda de 2 g/dL da hemoglobina. Atropelamento por automóvel."), /atropelamento/i);
  assert.match(mechanism("Queda da saturação para 80%. Ferimento por arma de fogo."), /ferimento por arma de fogo/i);
  assert.match(mechanism("Queda do estado geral. Capotamento."), /capotamento/i);
  assert.match(mechanism("Queda da PA para 70 mmHg. Trauma contuso em abdome."), /trauma contuso/i);
  assert.equal(mechanism("Queda do Ht de 12 para 8, sem descrição de mecanismo."), "");

  assert.match(mechanism("Queda da própria altura."), /queda da própria altura/i);
  assert.match(mechanism("Queda de nível, cerca de 3 metros."), /queda de n[ií]vel/i);
  assert.match(mechanism("Queda de 3 metros."), /queda de 3 metros/i);
  assert.match(mechanism("Queda da escada."), /queda da escada/i);
  assert.match(mechanism("Queda do telhado."), /queda do telhado/i);
  assert.match(mechanism("Colisão automobilística de alta energia há 2 horas."), /colis[aã]o automobilística de alta energia há 2 horas/i);
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

