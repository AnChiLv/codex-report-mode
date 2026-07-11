# Reviewer contract

Use one independent Reviewer Agent only when the gate returns `reviewer_required: true`.

Give the reviewer:

- the task summary;
- the raw evidence JSON;
- the diff, source list, test output, or artifact paths it can inspect;
- this required JSON response shape.

```json
{
  "verdict": "pass | revise | escalate",
  "findings": ["specific evidence-backed finding"],
  "missing_evidence": ["specific missing check"]
}
```

## Verdict rules

- `pass`: conclusions are supported and required checks are present.
- `revise`: evidence or claims can be corrected without human judgment.
- `escalate`: risk, failed validation, permission, or an unresolved decision prevents safe completion.

Do not ask the reviewer to rewrite the final report. Do not show it the Primary Agent's proposed report. Preserve its findings even when the final report is shorter.
