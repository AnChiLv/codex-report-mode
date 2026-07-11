# Report Mode

> Evidence before eloquence.

Report Mode is a small, reproducible system for adaptive Codex work reports. It combines an installable Skill, a deterministic evidence gate, and a conditional independent Reviewer Agent. It does not make every answer shorter: it spends more human attention only when risk, missing evidence, blockers, or decisions justify it.

**Live demo:** https://anchilv.github.io/codex-report-mode/

## Research question

Can a coding agent choose report detail from task evidence and decision value—rather than a fixed verbosity prompt—while preserving critical information and reducing unsupported claims?

The repository compares:

1. a normal assistant response;
2. a response with only a “be concise” prompt;
3. the full Skill + Harness + conditional Reviewer workflow.

## System

```text
Primary Agent completes or blocks
              ↓
      structured evidence JSON
              ↓
 deterministic Report Gate (shared by Skill, CLI, web)
       ↙                         ↘
brief report              independent Reviewer
                                  ↓
                       standard / escalation report
```

The Reviewer is not a permanent four-agent pipeline. It runs only when the gate finds medium/high risk, partial work, failed or missing validation, open questions, or a human decision.

## Try the deterministic Harness

Requires Node.js 18 or newer. No dependencies or build step are required.

```bash
node skills/adaptive-work-report/scripts/report-gate.mjs \
  --input path/to/evidence.json \
  --pretty
```

Example input:

```json
{
  "task_summary": "Repair the mobile payment button",
  "status": "completed",
  "risk": "low",
  "evidence": [
    { "type": "test", "label": "Mobile click flow", "result": "passed" }
  ],
  "changed_scope": ["payment button hit area"],
  "open_questions": [],
  "human_decision_needed": false
}
```

The gate returns only policy—not prose:

```json
{
  "mode": "brief",
  "required_sections": ["result", "changes", "verification"],
  "max_bullets": 3,
  "reviewer_required": false,
  "missing_evidence": [],
  "reason_codes": ["verified_low_risk"]
}
```

## Install the Codex Skill

Clone this repository, then copy the self-contained Skill into your personal Codex Skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/adaptive-work-report ~/.codex/skills/
```

Use it explicitly:

```text
$adaptive-work-report
```

For a repository-wide convention, merge the relevant section from [`AGENTS.example.md`](AGENTS.example.md) into the project's `AGENTS.md`.

The Skill:

- collects a structured evidence object after completion or immediately on a blocker;
- runs the deterministic gate;
- starts one independent Reviewer Agent when required and supported by the current Codex surface;
- refuses to imply that a review happened when a reviewer is unavailable;
- generates only the gate-required report sections.

## Evaluation

Six annotated fixtures cover verified code work, unverified code work, research trade-offs, partial research, deployment blockers, and human decisions.

```bash
node --test tests/*.test.mjs
node evals/run-evals.mjs --format markdown
node evals/run-evals.mjs --format json
```

Current fixture results:

| Variant | Required information | Unsupported claims | Irrelevant information | Action clarity |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 44% | 7 | 33% | 17% |
| Prompt-only | 54% | 3 | 0% | 50% |
| Skill + Harness | 100% | 0 | 0% | 100% |

These are deterministic scores over explicitly annotated fixtures, not a claim of general model performance. The annotations and scoring code are included for inspection.

## Repository map

```text
skills/adaptive-work-report/  installable Skill, schema, reviewer contract, gate
demo/cases.mjs                six reproducible traces; three shown on the web
evals/                        deterministic scoring and Markdown/JSON runner
tests/                        gate, CLI, and evaluation tests
index.html + app.js           interactive GitHub Pages research demo
```

## 中文说明

Report Mode 解决的不是“如何让 AI 永远少说一点”，而是：**如何让 Agent 根据风险、证据和人类决策价值，决定应该汇报多少。**

日常使用时，Primary Agent 完成任务并提交结构化证据。确定性 Harness 选择简短、标准或升级汇报，同时判断是否需要独立 Reviewer。低风险且证据充分的任务不会额外调用 Agent；中高风险、证据不足或需要人工决定时才触发复核。

网页不是随机调用模型的玩具。它回放真实、固定的运行记录，并允许修改状态、风险和验证证据，实时观察同一个 Harness 如何改变信息预算和 Reviewer 路由。

第一版只控制最终汇报和阻塞升级，不管理普通进度更新，也不构建通用 Agent 平台。

## Privacy and scope

- No API key, backend, account, or database.
- No chain-of-thought display.
- No dynamic swarm or multi-model router.
- No claim that fixture scores generalize beyond the included cases.

## License

MIT
