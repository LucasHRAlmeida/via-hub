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
  assert.doesNotMatch(output, /99876/);
});

test("faixa de volume ou horário não é redigida como telefone", () => {
  const preserved = [
    "Expansão com 1000-2000 mL de cristaloide. Lactato 4,1 mmol/L.",
    "Diurese 1000-1500 mL/24h. Creatinina 2,1 mg/dL.",
    "Plantão 0800-1600. FC 110 bpm.",
    "Coorte 2019-2024. NIHSS 16.",
    "Plaquetas 150000. INR 1,4.",
  ];
  for (const input of preserved) {
    assert.equal(redactDirectIdentifiers(input), input);
  }

  const phones = [
    "contato +55 35 98441-0983",
    "celular 11 99876-5432",
    "fone 99876-5432",
    "ligar (11) 3333-4444",
    "+55 11 3333-4444",
  ];
  for (const input of phones) {
    const output = redactDirectIdentifiers(input);
    assert.match(output, /TELEFONE REDIGIDO/, input);
    assert.doesNotMatch(output, /\d/, input);
  }
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

  // Qualificador do ensaio ou vírgula antes do valor não pode apagar o resultado
  // nem herdar o ng/L de outro analito na mesma oração.
  assert.match(extractNarrative("Troponina I: 2450 ng/L.", schema).troponin.value, /2450/);
  assert.match(extractNarrative("Troponina T 0,08 ng/mL.", schema).troponin.value, /0,08/);
  assert.match(extractNarrative("Troponina (I): 2450 ng/L.", schema).troponin.value, /2450/);
  assert.match(extractNarrative("Trop I 350 ng/L.", schema).troponin.value, /350/);
  assert.match(extractNarrative("Troponina ultrassensível: 18 ng/L.", schema).troponin.value, /18/);
  assert.match(extractNarrative("Troponina de alta sensibilidade: 22 ng/L.", schema).troponin.value, /22/);
  assert.match(extractNarrative("Troponina, 2450 ng/L.", schema).troponin.value, /2450/);
  assert.match(extractNarrative("Troponina I negativa.", schema).troponin.value, /negativa/i);

  const assayWithBnp = extractNarrative("Troponina I: 2450 ng/L, BNP 800 ng/L.", schema);
  assert.match(assayWithBnp.troponin.value, /2450/);
  assert.doesNotMatch(assayWithBnp.troponin.value, /800/);

  const serialAssay = extractNarrative("1ª troponina I: 18 ng/L. 2ª troponina I: 350 ng/L.", schema);
  assert.match(serialAssay.troponin.value, /350/);
  assert.doesNotMatch(serialAssay.troponin.value, /\b18\b/);
});

test("hemorragia negada depois do achado não entra como presente", () => {
  const schema = getSchema("polytrauma.trauma-surgery.v1");
  const absent = [
    "Sangramento ativo negado.",
    "Sangramento ativo, negado pelo paciente.",
    "Nega sangramento ativo.",
    "Negou sangramento importante.",
    "Nega-se choque hemorrágico.",
    "Choque hemorrágico negado.",
  ];
  for (const text of absent) {
    assert.match(extractNarrative(text, schema).hemorrhage.value, /^Não — /i, text);
  }

  assert.match(
    extractNarrative("Sangramento ativo em pelve.", schema).hemorrhage.value,
    /^Sim — /i,
  );
  assert.match(
    extractNarrative("Choque hemorrágico.", schema).hemorrhage.value,
    /^Sim — /i,
  );
  assert.match(
    extractNarrative("Nega sangramento ativo na cena. Sangramento ativo em pelve na admissão.", schema).hemorrhage.value,
    /^Sim — /i,
  );
  assert.match(
    extractNarrative("Sangramento não controlado.", schema).hemorrhage.value,
    /^Sim — /i,
  );
});

test("intervalo de evolução não entra como idade", () => {
  const schema = getSchema("sepsis-biliary.emergency-gastro.v1");
  const ranged = extractNarrative(
    "Paciente com 2 a 3 dias de dor em hipocôndrio direito. Mulher, 81 anos. PA 80/45.",
    schema,
  );
  assert.equal(ranged.age.value, 81);
  assert.equal(ranged.sex.value.toLowerCase(), "mulher");

  assert.equal(
    extractNarrative("Paciente, 3 a 4 horas de sintomas. Homem, 54 anos.", schema).age.value,
    54,
  );
  assert.equal(extractNarrative("Paciente com 2 a 3 dias de evolução.", schema).age.value, "");

  assert.equal(extractNarrative("Paciente 81 a.", schema).age.value, 81);
  assert.equal(extractNarrative("Paciente com 81 a, PA 80/45.", schema).age.value, 81);
  assert.equal(extractNarrative("Idade: 81 a.", schema).age.value, 81);
  assert.equal(extractNarrative("Homem, 62 a. PA 90/60.", schema).age.value, 62);
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

test("leitura marcada como atual não cede o campo ao valor anterior", () => {
  const sepsis = getSchema("sepsis-biliary.emergency-gastro.v1");
  const coronary = getSchema("acute-coronary-syndrome.cardiology.v1");
  const respiratory = getSchema("acute-respiratory-failure.critical-care.v1");
  const trauma = getSchema("polytrauma.trauma-surgery.v1");
  const stroke = getSchema("acute-ischemic-stroke.neurology.v1");

  const shock = extractNarrative("PA 180/110 na admissão. PA atual 80/50.", coronary);
  assert.equal(shock.sbp.value, 80);
  assert.equal(shock.dbp.value, 50);

  const now = extractNarrative("PA 180/110 na admissão. Agora PA 80/50.", coronary);
  assert.equal(now.sbp.value, 80);
  assert.equal(now.dbp.value, 50);

  assert.equal(extractNarrative("PA atual: 80/50 mmHg.", coronary).sbp.value, 80);
  assert.equal(extractNarrative("PA 92/58 mmHg.", coronary).sbp.value, 92);
  assert.equal(extractNarrative("PA 92/58 mmHg.", coronary).dbp.value, 58);
  assert.equal(extractNarrative("PA 80/50 na admissão.", coronary).sbp.value, 80);
  assert.equal(extractNarrative("PA 80/50. PA 120/70 após volume.", coronary).sbp.value, 80);

  assert.equal(extractNarrative("FC 140 na entrada. FC atual 88 bpm.", coronary).heartRate.value, 88);
  assert.equal(extractNarrative("FC 118 bpm.", coronary).heartRate.value, 118);
  assert.equal(extractNarrative("PAM 90 na entrada. PAM atual 48.", sepsis).map.value, 48);
  assert.equal(extractNarrative("PAM 58 mmHg.", sepsis).map.value, 58);
  assert.equal(extractNarrative("FR 16 basal. FR atual 36 irpm.", respiratory).respiratoryRate.value, 36);
  assert.equal(extractNarrative("Tax 36,2 na triagem. Tax atual 39,8.", sepsis).temperature.value, 39.8);
  assert.equal(extractNarrative("Glasgow 14 na entrada. Agora Glasgow 8.", trauma).gcs.value, 8);
  assert.equal(extractNarrative("Glasgow 14.", trauma).gcs.value, 14);
  assert.equal(extractNarrative("SpO2 97% na triagem. SpO2 atual 82%.", respiratory).spo2.value, 82);
  assert.equal(extractNarrative("SpO2 93% em cateter nasal 3 L/min.", respiratory).spo2.value, 93);
  assert.equal(extractNarrative("FiO2 40% na chegada. FiO2 atual 100%. PaO2 55.", respiratory).fio2.value, 100);
  assert.equal(extractNarrative("FiO2 40% na chegada. FiO2 atual 100%. PaO2 55.", respiratory).pao2.value, 55);
  assert.equal(extractNarrative("Lactato 1,2 na admissão. Lactato atual 6,4 mmol/L.", sepsis).lactate.value, 6.4);
  assert.equal(extractNarrative("Lactato 4,1 mmol/L. Lac 1,2 na admissão.", sepsis).lactate.value, 4.1);
  assert.equal(extractNarrative("Lactato 4,1 mmol/L.", sepsis).lactate.value, 4.1);
  assert.equal(extractNarrative("INR 1,1 basal. INR atual 3,8.", trauma).inr.value, 3.8);
  assert.equal(extractNarrative("INR 1,4.", trauma).inr.value, 1.4);
  assert.equal(extractNarrative("NIHSS 4 na admissão. NIHSS atual 18.", stroke).nihss.value, 18);
  assert.equal(extractNarrative("NIHSS 16.", stroke).nihss.value, 16);
  assert.equal(extractNarrative("Plaquetas 180000 na admissão. Plaquetas atuais 42000.", sepsis).platelets.value, 42000);
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

