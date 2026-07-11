import { SHOWCASE_CASES, CASES } from "./demo/cases.mjs";
import { evaluateEvidence } from "./skills/adaptive-work-report/scripts/report-policy.mjs";
import { evaluateCase, summarize } from "./evals/scoring.mjs";

const $ = (id) => document.getElementById(id);
const modeLabels = { brief: "简短汇报", standard: "标准汇报", escalate: "升级汇报" };
const sectionLabels = { result: "结果", changes: "改动", verification: "验证", risks: "风险", next_step: "下一步", blocker: "阻塞", impact: "影响", decision: "需要决定" };
const resultLabels = { passed: "通过", observed: "已观察", failed: "失败", not_run: "未执行" };

const state = { caseIndex: 0, status: "", risk: "", decision: false, verification: true };

function currentCase() { return SHOWCASE_CASES[state.caseIndex]; }

function resetCase(index) {
  state.caseIndex = index;
  const item = currentCase();
  state.status = item.input.status;
  state.risk = item.input.risk;
  state.decision = item.input.human_decision_needed;
  state.verification = true;
  render();
}

function currentInput() {
  const source = currentCase().input;
  return {
    ...source,
    status: state.status,
    risk: state.risk,
    human_decision_needed: state.decision,
    evidence: source.evidence.map((item) => state.verification ? { ...item } : { ...item, result: item.result === "failed" ? "failed" : "not_run" })
  };
}

function isRecordedTrace() {
  const source = currentCase().input;
  return state.status === source.status && state.risk === source.risk && state.decision === source.human_decision_needed && state.verification;
}

function buildReport(item, gate) {
  const facts = item.facts;
  if (gate.mode === "brief") return `【结果】${facts.result}\n【改动】${facts.changes}\n【验证】${gate.missing_evidence.length ? "没有可用验证证据。" : facts.verification}`;
  if (gate.mode === "standard") return `【结果】${facts.result}\n【验证】${gate.missing_evidence.length ? "验证证据不足，不能宣称已验证完成。" : facts.verification}\n【风险】${facts.risks}\n【下一步】${facts.next_step}`;
  return `【阻塞】${facts.blocker}\n【影响】${facts.impact}\n【需要决定】${facts.decision}`;
}

function renderCases() {
  $("casePicker").replaceChildren(...SHOWCASE_CASES.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `case-button${index === state.caseIndex ? " active" : ""}`;
    button.innerHTML = `<span>0${index + 1} · ${item.category}</span><b>${item.title}</b><small>${item.subtitle}</small>`;
    button.addEventListener("click", () => resetCase(index));
    return button;
  }));
}

function renderEvidence(input) {
  $("evidenceList").replaceChildren(...input.evidence.map((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="evidence-result ${item.result}">${resultLabels[item.result]}</span><div><b>${item.label}</b><small>${item.type}</small></div>`;
    return li;
  }));
}

function renderReviewer(gate) {
  const item = currentCase();
  const card = $("reviewerCard");
  card.classList.toggle("triggered", gate.reviewer_required);
  if (!gate.reviewer_required) {
    $("reviewerState").textContent = "跳过：低风险且证据充分";
    $("reviewerFinding").textContent = "没有为了流程完整而额外调用 Agent。";
    return;
  }
  if (isRecordedTrace() && item.reviewer) {
    $("reviewerState").textContent = `已触发 · ${item.reviewer.verdict}`;
    $("reviewerFinding").textContent = item.reviewer.findings[0];
  } else {
    $("reviewerState").textContent = "已触发 · 等待新复核";
    $("reviewerFinding").textContent = "你修改了原始证据；系统不会伪造一条 Reviewer 结论。";
  }
}

function renderMetrics() {
  const summary = summarize(CASES.map(evaluateCase));
  const cards = [
    ["Harness 路由准确率", `${Math.round(summary.mode_accuracy * 100)}%`, "6 / 6 样例"],
    ["必需信息覆盖", `${Math.round(summary.variants.system.coverage * 100)}%`, `Prompt-only ${Math.round(summary.variants.prompt_only.coverage * 100)}%`],
    ["无证据结论", `${summary.variants.system.unsupported_claims}`, `Prompt-only ${summary.variants.prompt_only.unsupported_claims}`],
    ["行动清晰度", `${Math.round(summary.variants.system.action_clarity * 100)}%`, `Baseline ${Math.round(summary.variants.baseline.action_clarity * 100)}%`]
  ];
  $("metrics").replaceChildren(...cards.map(([label, value, note]) => {
    const div = document.createElement("div");
    div.innerHTML = `<span>${label}</span><b>${value}</b><small>${note}</small>`;
    return div;
  }));
}

function render() {
  const item = currentCase();
  const input = currentInput();
  const gate = evaluateEvidence(input);
  renderCases();
  renderEvidence(input);

  $("taskTitle").textContent = item.title;
  $("taskSummary").textContent = input.task_summary;
  $("statusSelect").value = state.status;
  $("riskSelect").value = state.risk;
  $("decisionToggle").checked = state.decision;
  $("toggleVerification").textContent = state.verification ? "移除验证证据" : "恢复验证证据";

  $("modeBadge").textContent = modeLabels[gate.mode];
  $("modeBadge").dataset.mode = gate.mode;
  $("bulletBudget").textContent = `≤ ${gate.max_bullets} 条`;
  $("reviewRequired").textContent = gate.reviewer_required ? "需要" : "跳过";
  $("missingEvidence").textContent = gate.missing_evidence.length ? gate.missing_evidence.join(", ") : "无";
  $("sectionChips").replaceChildren(...gate.required_sections.map((section) => {
    const span = document.createElement("span");
    span.textContent = sectionLabels[section];
    return span;
  }));
  $("gateJson").textContent = JSON.stringify(gate, null, 2);

  const positiveEvidence = input.evidence.filter((entry) => entry.result === "passed" || entry.result === "observed").length;
  $("primaryState").textContent = `${input.status} · ${positiveEvidence} 条有效证据`;
  $("harnessState").textContent = `${modeLabels[gate.mode]} · ${gate.reason_codes.join(" / ")}`;
  $("reportState").textContent = `${gate.required_sections.length} 个必需栏目 · 最多 ${gate.max_bullets} 条`;
  renderReviewer(gate);

  $("baselineOutput").textContent = item.outputs.baseline;
  $("promptOutput").textContent = item.outputs.promptOnly;
  $("systemOutput").textContent = buildReport(item, gate);
}

async function copyText(value, button) {
  await navigator.clipboard.writeText(value);
  const original = button.textContent;
  button.textContent = "已复制";
  setTimeout(() => { button.textContent = original; }, 1200);
}

$("statusSelect").addEventListener("change", (event) => { state.status = event.target.value; render(); });
$("riskSelect").addEventListener("change", (event) => { state.risk = event.target.value; render(); });
$("decisionToggle").addEventListener("change", (event) => { state.decision = event.target.checked; render(); });
$("toggleVerification").addEventListener("click", () => { state.verification = !state.verification; render(); });
$("copyInstall").addEventListener("click", (event) => copyText($("installCommand").textContent, event.currentTarget));

renderMetrics();
resetCase(0);
