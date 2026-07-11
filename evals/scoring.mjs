import { evaluateEvidence } from "../skills/adaptive-work-report/scripts/report-policy.mjs";

export function scoreVariant(annotation, requiredSections) {
  const covered = new Set(annotation.covered_sections);
  const matched = requiredSections.filter((section) => covered.has(section)).length;
  return {
    coverage: requiredSections.length === 0 ? 1 : matched / requiredSections.length,
    unsupported_claims: annotation.unsupported_claims,
    irrelevant_ratio: annotation.total_units === 0 ? 0 : annotation.irrelevant_units / annotation.total_units,
    action_clear: annotation.action_clear
  };
}

export function evaluateCase(testCase) {
  const gate = evaluateEvidence(testCase.input);
  return {
    id: testCase.id,
    category: testCase.category,
    expected_mode: testCase.expected_mode,
    actual_mode: gate.mode,
    mode_match: gate.mode === testCase.expected_mode,
    reviewer_required: gate.reviewer_required,
    missing_evidence: gate.missing_evidence,
    variants: {
      baseline: scoreVariant(testCase.annotations.baseline, gate.required_sections),
      prompt_only: scoreVariant(testCase.annotations.promptOnly, gate.required_sections),
      system: scoreVariant(testCase.annotations.system, gate.required_sections)
    }
  };
}

export function summarize(results) {
  const variants = ["baseline", "prompt_only", "system"];
  const summary = {};
  for (const variant of variants) {
    const rows = results.map((result) => result.variants[variant]);
    summary[variant] = {
      coverage: rows.reduce((sum, row) => sum + row.coverage, 0) / rows.length,
      unsupported_claims: rows.reduce((sum, row) => sum + row.unsupported_claims, 0),
      irrelevant_ratio: rows.reduce((sum, row) => sum + row.irrelevant_ratio, 0) / rows.length,
      action_clarity: rows.filter((row) => row.action_clear).length / rows.length
    };
  }
  return {
    cases: results.length,
    mode_accuracy: results.filter((result) => result.mode_match).length / results.length,
    variants: summary
  };
}
