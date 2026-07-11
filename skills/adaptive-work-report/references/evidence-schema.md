# Evidence schema

Create exactly one JSON object:

```json
{
  "task_summary": "Repair the mobile payment button",
  "status": "completed",
  "risk": "low",
  "evidence": [
    {
      "type": "test",
      "label": "Mobile click-flow test",
      "result": "passed"
    }
  ],
  "changed_scope": ["payment button hit area"],
  "open_questions": [],
  "human_decision_needed": false
}
```

## Fields

- `task_summary`: non-empty string describing the outcome being checked.
- `status`: `completed`, `partial`, or `blocked`.
- `risk`: `low`, `medium`, or `high`.
- `evidence`: array of observed records.
  - `type`: `test`, `inspection`, `source`, or `artifact`.
  - `label`: short, specific description of what was checked.
  - `result`: `passed`, `failed`, `observed`, or `not_run`.
- `changed_scope`: concrete files, components, decisions, or deliverables affected.
- `open_questions`: unresolved facts or choices.
- `human_decision_needed`: true only when work cannot safely proceed without human judgment.

## Integrity rules

- Use `passed` only for an executed check with a passing result.
- Use `observed` for inspected artifacts or cited sources.
- Use `not_run` instead of omitting a planned check.
- Do not convert inference into evidence.
- Include failed checks even when later work appears successful.
