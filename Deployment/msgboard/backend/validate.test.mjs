import test from "node:test";
import assert from "node:assert/strict";
import { validateMessage, MAX_BODY } from "./validate.js";

test("rejects non-objects", () => {
  assert.equal(validateMessage(null).ok, false);
  assert.equal(validateMessage("hi").ok, false);
  assert.equal(validateMessage([]).ok, false);
});

test("rejects missing or blank fields", () => {
  assert.equal(validateMessage({}).ok, false);
  assert.equal(validateMessage({ author: "  ", body: "hi" }).ok, false);
  assert.equal(validateMessage({ author: "a", body: "   " }).ok, false);
});

test("trims and accepts good input", () => {
  const r = validateMessage({ author: "  Sion ", body: " hello " });
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { author: "Sion", body: "hello" });
});

test("rejects an over-long body", () => {
  assert.equal(validateMessage({ author: "a", body: "x".repeat(MAX_BODY + 1) }).ok, false);
});
