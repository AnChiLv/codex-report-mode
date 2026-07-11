---
name: adaptive-work-report
description: Generate evidence-gated Codex completion reports and immediate blocker escalations with adaptive detail. Use when a coding, research, or operational task finishes, becomes partial, or is blocked; when a user asks for a concise work report; or when an AGENTS.md requires final reports to be checked for verification evidence, risk, open questions, and conditional independent review.
---

# Adaptive Work Report

Turn task evidence into a concise report whose detail matches risk and decision value. Never use this skill for routine progress chatter.

## Workflow

1. Finish the task, or stop at the first genuine blocker.
2. Read [references/evidence-schema.md](references/evidence-schema.md) and create one evidence JSON object. Record only observed facts; use `not_run` when verification did not happen.
3. Save the object to a temporary JSON file and run:

   ```bash
   node <skill-directory>/scripts/report-gate.mjs --input <evidence.json> --pretty
   ```

4. Treat the gate result as binding:
   - Do not claim verified completion when `missing_evidence` is non-empty.
   - Use only the returned `required_sections`.
   - Stay within `max_bullets` unless the user explicitly requests more detail.
5. If `reviewer_required` is true, follow [references/reviewer-contract.md](references/reviewer-contract.md). Start one independent Reviewer Agent when the current Codex surface supports subagents.
   - Give it the task, evidence JSON, and inspectable artifacts or diff.
   - Do not give it the Primary Agent's proposed final report.
   - If review returns `revise`, fix the evidence or mark the task `partial`, then run the gate again.
   - If review returns `escalate`, keep the report in escalation mode.
   - If a reviewer cannot be started, say that review is required but unavailable; never imply that review happened.
6. Write the report from verified facts. Lead with the outcome, omit process narration, and name the exact decision needed when escalating.

## Section Contract

- `brief`: `Result`, `Changes`, `Verification`.
- `standard`: `Result`, `Verification`, `Risks`, `Next step`.
- `escalate`: `Blocker`, `Impact`, `Decision needed`.

Translate headings to the user's language. Omit empty prose, but never omit a required heading; state `Not verified` or `None observed` when necessary.

## Completion Rules

- Prefer terminal output, tests, inspected artifacts, sources, diffs, or screenshots over confidence statements.
- Separate facts from inference.
- Do not repeat the user's task or expose private reasoning.
- Report a blocker immediately instead of waiting for a normal completion report.
- Respect a user-requested output format when it is stricter than the gate.
