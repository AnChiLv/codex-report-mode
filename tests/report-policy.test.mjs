import test from "node:test";
import assert from "node:assert/strict";
import { evaluateEvidence } from "../skills/adaptive-work-report/scripts/report-policy.mjs";

const base = {
  task_summary: "Small verified change",
  status: "completed",
  risk: "low",
  evidence: [{ type: "test", label: "unit tests", result: "passed" }],
  changed_scope: ["button"],
  open_questions: [],
  human_decision_needed: false
};

test("verified low-risk work is brief without reviewer", () => {
  assert.deepEqual(evaluateEvidence(base), {
    mode: "brief",
    required_sections: ["result", "changes", "verification"],
    max_bullets: 3,
    reviewer_required: false,
    missing_evidence: [],
    reason_codes: ["verified_low_risk"]
  });
});

test("medium risk requires standard review", () => {
  const result = evaluateEvidence({ ...base, risk: "medium" });
  assert.equal(result.mode, "standard");
  assert.equal(result.reviewer_required, true);
  assert.ok(result.reason_codes.includes("risk_medium"));
});

test("blocked work escalates", () => {
  const result = evaluateEvidence({ ...base, status: "blocked", risk: "high", human_decision_needed: true });
  assert.equal(result.mode, "escalate");
  assert.deepEqual(result.required_sections, ["blocker", "impact", "decision"]);
});

test("missing verification prevents brief completion", () => {
  const result = evaluateEvidence({ ...base, evidence: [{ type: "test", label: "unit tests", result: "not_run" }] });
  assert.equal(result.mode, "standard");
  assert.ok(result.missing_evidence.includes("verification_evidence"));
});

test("failed evidence requires review", () => {
  const result = evaluateEvidence({ ...base, evidence: [{ type: "test", label: "unit tests", result: "failed" }] });
  assert.equal(result.mode, "standard");
  assert.ok(result.reason_codes.includes("failed_evidence"));
  assert.ok(result.missing_evidence.includes("failed_check_resolution"));
});

test("human decision always escalates", () => {
  const result = evaluateEvidence({ ...base, human_decision_needed: true });
  assert.equal(result.mode, "escalate");
});

test("invalid input throws", () => {
  assert.throws(() => evaluateEvidence({ ...base, status: "done" }), /status/);
});
