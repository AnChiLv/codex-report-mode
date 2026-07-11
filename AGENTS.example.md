## Adaptive Work Report

Use `$adaptive-work-report` when a task finishes, becomes partial, or is blocked.

- Submit structured evidence to the deterministic report gate before writing the final answer.
- Start one independent Reviewer Agent only when the gate returns `reviewer_required: true`.
- Never claim verified completion when required evidence is missing.
- Use the gate's report mode, required sections, and bullet budget.
- Escalate blockers immediately; do not emit routine progress reports through this workflow.
