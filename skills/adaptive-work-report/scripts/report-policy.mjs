const STATUS = new Set(["completed", "partial", "blocked"]);
const RISK = new Set(["low", "medium", "high"]);
const EVIDENCE_TYPE = new Set(["test", "inspection", "source", "artifact"]);
const EVIDENCE_RESULT = new Set(["passed", "failed", "observed", "not_run"]);

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new TypeError(`${label} must be an array of non-empty strings`);
  }
}

export function validateEvidenceInput(input) {
  requireObject(input, "input");
  requireString(input.task_summary, "task_summary");
  if (!STATUS.has(input.status)) throw new TypeError("status must be completed, partial, or blocked");
  if (!RISK.has(input.risk)) throw new TypeError("risk must be low, medium, or high");
  if (!Array.isArray(input.evidence)) throw new TypeError("evidence must be an array");
  input.evidence.forEach((item, index) => {
    requireObject(item, `evidence[${index}]`);
    if (!EVIDENCE_TYPE.has(item.type)) throw new TypeError(`evidence[${index}].type is invalid`);
    requireString(item.label, `evidence[${index}].label`);
    if (!EVIDENCE_RESULT.has(item.result)) throw new TypeError(`evidence[${index}].result is invalid`);
  });
  requireStringArray(input.changed_scope, "changed_scope");
  requireStringArray(input.open_questions, "open_questions");
  if (typeof input.human_decision_needed !== "boolean") {
    throw new TypeError("human_decision_needed must be a boolean");
  }
  return input;
}

export function evaluateEvidence(rawInput) {
  const input = validateEvidenceInput(rawInput);
  const successfulEvidence = input.evidence.filter((item) => item.result === "passed" || item.result === "observed");
  const failedEvidence = input.evidence.filter((item) => item.result === "failed");
  const missingEvidence = [];
  const reasons = [];

  if (successfulEvidence.length === 0) missingEvidence.push("verification_evidence");
  if (input.status === "completed" && input.changed_scope.length === 0) missingEvidence.push("changed_scope");
  if (failedEvidence.length > 0) missingEvidence.push("failed_check_resolution");

  const escalate = input.status === "blocked" || input.risk === "high" || input.human_decision_needed;
  if (input.status === "blocked") reasons.push("status_blocked");
  if (input.risk === "high") reasons.push("risk_high");
  if (input.human_decision_needed) reasons.push("human_decision_needed");

  if (escalate) {
    return {
      mode: "escalate",
      required_sections: ["blocker", "impact", "decision"],
      max_bullets: 3,
      reviewer_required: true,
      missing_evidence: missingEvidence,
      reason_codes: reasons
    };
  }

  const standard = input.status === "partial" || input.risk === "medium" || failedEvidence.length > 0 || missingEvidence.length > 0 || input.open_questions.length > 0;
  if (input.status === "partial") reasons.push("status_partial");
  if (input.risk === "medium") reasons.push("risk_medium");
  if (failedEvidence.length > 0) reasons.push("failed_evidence");
  if (missingEvidence.includes("verification_evidence")) reasons.push("missing_verification");
  if (input.open_questions.length > 0) reasons.push("open_questions");

  if (standard) {
    return {
      mode: "standard",
      required_sections: ["result", "verification", "risks", "next_step"],
      max_bullets: 5,
      reviewer_required: true,
      missing_evidence: missingEvidence,
      reason_codes: reasons
    };
  }

  return {
    mode: "brief",
    required_sections: ["result", "changes", "verification"],
    max_bullets: 3,
    reviewer_required: false,
    missing_evidence: [],
    reason_codes: ["verified_low_risk"]
  };
}
