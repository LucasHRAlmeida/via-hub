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

test("EVAM_VERSION patch bump for Pilot A TTL", () => {
  assert.equal(EVAM_VERSION, "1.1.0");
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
  assert.equal(envelope.evamVersion, "1.1.0");
  assert.ok(envelope.provenance.lactate.freshness);
  assert.ok(envelope.provenance.lactate.observedAt);
  assert.ok(envelope.provenance.map.freshness);
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
  assert.equal(fields.lactate.observedAt, "2026-09-20T12:00:00.000Z");
});

test("blank hoursSinceRecognition does not invent a fresh timestamp", () => {
  const now = new Date("2026-09-27T12:00:00.000Z");
  const fields = {
    lactate: { value: 4.1, origin: "extração automática", confidence: "heurística", excerpt: "" },
    map: { value: 58, origin: "extração automática", confidence: "heurística", excerpt: "" },
    hoursSinceRecognition: { value: "" },
  };
  enrichFieldFreshness(fields, { now });
  assert.equal(fields.lactate.freshness, undefined);
  assert.equal(fields.lactate.observedAt, undefined);
  assert.equal(fields.map.freshness, undefined);
  assert.equal(fields.map.observedAt, undefined);
});

test("zero hours since recognition is an observation at now", () => {
  const now = new Date("2026-09-27T12:00:00.000Z");
  const fields = {
    map: { value: 58, origin: "revisão humana", confidence: "manual", excerpt: "" },
    hoursSinceRecognition: { value: 0 },
  };
  enrichFieldFreshness(fields, { now });
  assert.equal(fields.map.freshness, "fresh");
  assert.equal(fields.map.observedAt, now.toISOString());
});

test("narrative without a recognition interval does not mark vitals fresh", () => {
  const schema = getSchema("acute-ischemic-stroke.neurology.v1");
  const text = "Mulher, 67 anos. Último momento bem às 07:10. PA 178/96 mmHg, Glasgow 13, NIHSS 16.";
  const fields = extractNarrative(text, schema);
  assert.equal(fields.hoursSinceRecognition.value, "");
  assert.equal(fields.sbp.value, 178);
  assert.equal(fields.nihss.value, 16);
  assert.equal(fields.sbp.freshness, undefined);
  assert.equal(fields.nihss.freshness, undefined);
  assert.equal(fields.sbp.observedAt, undefined);
});

test("changing hoursSinceRecognition recomputes derived freshness", () => {
  const now = new Date("2026-09-27T12:00:00.000Z");
  const fields = {
    lactate: { value: 4.1, origin: "extração automática", confidence: "heurística", excerpt: "" },
    map: { value: 58, origin: "extração automática", confidence: "heurística", excerpt: "" },
    hoursSinceRecognition: { value: 18 },
  };
  enrichFieldFreshness(fields, { now });
  assert.equal(fields.lactate.freshness, "expired");
  assert.equal(fields.map.freshness, "expired");

  fields.hoursSinceRecognition = { value: 0.5, origin: "revisão humana", confidence: "validado/editado manualmente", excerpt: "" };
  enrichFieldFreshness(fields, { now });
  assert.equal(fields.lactate.freshness, "fresh");
  assert.equal(fields.map.freshness, "fresh");
  assert.equal(fields.map.observedAt, "2026-09-27T11:30:00.000Z");

  fields.hoursSinceRecognition.value = "";
  enrichFieldFreshness(fields, { now });
  assert.equal(fields.map.freshness, undefined);
  assert.equal(fields.map.observedAt, undefined);
  assert.equal(fields.lactate.validUntil, undefined);
});
