import test from "node:test";
import assert from "node:assert/strict";
import { getSchema, getFieldMaxAgeHours, EVAM_VERSION } from "../schemas.js";
import {
  computeFreshness,
  deriveValidUntil,
  parseObservedAt,
  enrichFieldFreshness,
  extractNarrative,
  buildEnvelope,
} from "../parser.js";

test("EVAM_VERSION patch bump for recorded provenance", () => {
  assert.equal(EVAM_VERSION, "1.1.1");
});

test("maxAgeHours defaults exist for critical lab/vital fields", () => {
  assert.equal(getFieldMaxAgeHours("lactate"), 6);
  assert.equal(getFieldMaxAgeHours("map"), 2);
  assert.equal(getFieldMaxAgeHours("troponin"), 6);
  assert.equal(getFieldMaxAgeHours("creatinine"), 24);
  assert.equal(getFieldMaxAgeHours("age"), null);
});

test("computeFreshness bands: fresh / stale / expired", () => {
  const now = new Date("2026-09-27T12:00:00.000Z");
  assert.equal(computeFreshness("2026-09-27T11:00:00.000Z", 6, now), "fresh"); // 1h < 3h
  assert.equal(computeFreshness("2026-09-27T08:00:00.000Z", 6, now), "stale"); // 4h >= 3h, < 6h
  assert.equal(computeFreshness("2026-09-27T05:00:00.000Z", 6, now), "expired"); // 7h >= 6h
  assert.equal(computeFreshness(null, 6, now), null);
});

test("deriveValidUntil and epoch parsing", () => {
  const observed = "2026-09-27T10:00:00.000Z";
  assert.equal(deriveValidUntil(observed, 6), "2026-09-27T16:00:00.000Z");
  const epochSec = String(Math.floor(Date.parse(observed) / 1000));
  assert.equal(parseObservedAt(epochSec)?.toISOString(), observed);
});

test("envelope provenance carries freshness when hoursSinceRecognition known", () => {
  const schema = getSchema("sepsis-biliary.emergency-gastro.v1");
  const text = "Mulher, 81 anos. PAM 58. Lactato 4,1 mmol/L; bilirrubina total 12,9. Reconhecido há 18 horas.";
  const fields = extractNarrative(text, schema);
  assert.ok(fields.lactate.freshness, "lactate should receive freshness");
  assert.ok(["fresh", "stale", "expired"].includes(fields.lactate.freshness));
  assert.ok(fields.lactate.observedAt);
  assert.ok(fields.lactate.validUntil);

  const envelope = buildEnvelope({ sourceText: text, schema, fields });
  assert.equal(envelope.evamVersion, "1.1.1");
  assert.ok(envelope.provenance.lactate.freshness);
  assert.ok(envelope.provenance.lactate.observedAt);
  assert.ok(envelope.provenance.map.freshness);
  assert.match(envelope.provenance.lactate.recorded, /^\d{4}-\d{2}-\d{2}T/);
});

test("reconhecimento explícito prevalece sobre «há» incidental no TTL", () => {
  const schema = getSchema("sepsis-biliary.emergency-gastro.v1");
  const text = "Antibiótico iniciado há 2 horas. Sepse reconhecida há 20 horas. Mulher, 70 anos. PAM 58. Lactato 5,0 mmol/L.";
  const fields = extractNarrative(text, schema);
  assert.equal(fields.hoursSinceRecognition.value, 20);
  assert.equal(fields.lactate.value, 5);
  assert.equal(fields.lactate.freshness, "expired");
  assert.equal(fields.map.freshness, "expired");

  const nounForm = extractNarrative(
    "Dor há 1 hora. Reconhecimento de colangite com sepse há 18 horas. PAM 58. Lactato 4,1.",
    schema,
  );
  assert.equal(nounForm.hoursSinceRecognition.value, 18);
  assert.equal(nounForm.lactate.freshness, "expired");
});

test("qualificador entre «há» e o número não cede o TTL ao intervalo seguinte", () => {
  const schema = getSchema("sepsis-biliary.emergency-gastro.v1");
  const texts = [
    "Sepse reconhecida há cerca de 18 horas. Antibiótico há 2 horas. PAM 58. Lactato 4,1 mmol/L.",
    "Sepse reconhecida há cerca de 18 horas. PAM 58. Lactato 4,1 mmol/L.",
    "Sepse reconhecida há mais de 18 horas. Noradrenalina há 2 horas. PAM 58. Lactato 4,1 mmol/L.",
    "Sepse reconhecida há aproximadamente 18 horas. Antibiótico há 2 horas. PAM 58. Lactato 4,1 mmol/L.",
    "Sepse reconhecida há umas 18 horas. Antibiótico há 2 horas. PAM 58. Lactato 4,1 mmol/L.",
    "Antibiótico há 2 horas. Sepse reconhecida há cerca de 20 horas. PAM 58. Lactato 5,0 mmol/L.",
    "Sepse reconhecida há mais ou menos 18 horas. Dor há 2 horas. PAM 58. Lactato 4,1 mmol/L.",
    "Reconhecimento há pelo menos 18 h. Antibiótico há 2 horas. PAM 58. Lactato 4,1 mmol/L.",
  ];
  for (const text of texts) {
    const fields = extractNarrative(text, schema);
    const expectedHours = text.includes("20 horas") ? 20 : 18;
    assert.equal(fields.hoursSinceRecognition.value, expectedHours, text);
    assert.equal(fields.lactate.freshness, "expired", text);
    assert.equal(fields.map.freshness, "expired", text);
  }
});

test("«há» genérico permanece quando não há reconhecimento explícito", () => {
  const schema = getSchema("acute-coronary-syndrome.cardiology.v1");
  const text = "Homem, 62 anos. Dor torácica iniciada há 3 horas. PA 92/58 mmHg.";
  const fields = extractNarrative(text, schema);
  assert.equal(fields.hoursSinceRecognition.value, 3);

  const qualified = extractNarrative(
    "Homem, 62 anos. Dor torácica iniciada há cerca de 18 horas. PA 92/58 mmHg.",
    schema,
  );
  assert.equal(qualified.hoursSinceRecognition.value, 18);
  assert.equal(qualified.sbp.freshness, "expired");

  const firstInterval = extractNarrative(
    "Antibiótico há cerca de 2 horas. Dor há 18 horas. PA 92/58 mmHg.",
    schema,
  );
  assert.equal(firstInterval.hoursSinceRecognition.value, 2);
});

test("explicit expired observedAt forces expired freshness", () => {
  const now = new Date("2026-09-27T12:00:00.000Z");
  const fields = {
    lactate: {
      value: 4.1,
      origin: "revisão humana",
      confidence: "manual",
      excerpt: "",
      observedAt: "2026-09-20T12:00:00.000Z", // 7 days ago
    },
    hoursSinceRecognition: { value: "" },
  };
  enrichFieldFreshness(fields, { now });
  assert.equal(fields.lactate.freshness, "expired");
});
