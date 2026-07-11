import test from "node:test";
import assert from "node:assert/strict";
import { CASES } from "../demo/cases.mjs";
import { evaluateCase, summarize } from "../evals/scoring.mjs";

test("six fixtures match expected harness modes", () => {
  const results = CASES.map(evaluateCase);
  assert.equal(results.length, 6);
  assert.ok(results.every((result) => result.mode_match));
});

test("full system improves evidence coverage and unsupported claims", () => {
  const summary = summarize(CASES.map(evaluateCase));
  assert.ok(summary.variants.system.coverage > summary.variants.prompt_only.coverage);
  assert.ok(summary.variants.system.coverage > summary.variants.baseline.coverage);
  assert.ok(summary.variants.system.unsupported_claims < summary.variants.prompt_only.unsupported_claims);
  assert.equal(summary.mode_accuracy, 1);
});
