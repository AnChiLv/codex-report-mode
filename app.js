const $ = (id) => document.getElementById(id);
const API_STORAGE_KEY = "report-mode-api-settings-v1";

const MODES = {
  brief: {
    label: "简短交付",
    description: "结果、改动、验证。",
    reportPreview: "【结果】已完成局部交付。\n【完成】仅列出会影响使用者的改动。\n【验证】说明实际做过的检查；未验证则直说。",
    instructions: "先用一句话给结果。只保留【结果】【完成】【验证】三个栏目；总计 3–6 行。不要复述任务、思考过程或礼貌套话。"
  },
  standard: {
    label: "标准决策",
    description: "结果、取舍、下一步。",
    reportPreview: "【结论】先给出推荐方案。\n【关键取舍】只说明一个真正影响选择的原因。\n【验证/下一步】说明证据或可执行动作。",
    instructions: "先给结论，再说明一个关键取舍与下一步。使用【结论】【关键取舍】【验证/下一步】；总计不超过 10 行。不要堆砌背景资料。"
  },
  escalate: {
    label: "升级回报",
    description: "阻塞、影响、需要决定什么。",
    reportPreview: "【阻塞】具体说明卡点。\n【影响】说明无法继续或受影响的范围。\n【需要决定】给出最小、明确的选择。",
    instructions: "明确说明【阻塞】【影响】【需要决定】。不要假装完成，不要提供没有依据的解决方案。让负责人能立刻决定下一步。"
  }
};

const CASES = {
  code: {
    task: "修复支付页在移动端点击“确认支付”无响应的问题，并说明是否已验证。",
    stage: "done",
    risk: "low",
    mode: "brief",
    ordinary: "我已经对支付页的问题进行了比较详细的排查。首先我查看了移动端和桌面端的事件绑定差异，发现移动端容器上的一层样式会影响点击事件。随后我尝试了几种可能的修复方式，并最终选择调整按钮的层级和点击区域。\n\n修改完成后，我也检查了相关组件是否会受到影响。目前在本地的模拟设备上测试，确认支付按钮已经可以正常点击。我建议后续再由测试同学在更多真机上验证，以确保不存在其他兼容性问题。",
    report: "【结果】支付页移动端“确认支付”按钮已恢复响应。\n【完成】调整了遮挡层级与按钮点击区域，未改动支付流程。\n【验证】已在本地移动端模拟器完成点击和下单前流程验证；真机回归尚未执行。"
  },
  research: {
    task: "为代码修复助手选择一个可在本地部署的模型方案，比较 Qwen 与更大闭源模型的取舍。",
    stage: "done",
    risk: "medium",
    mode: "standard",
    ordinary: "关于模型选择，我从能力、部署难度、成本、上下文长度、工具调用能力以及后续迭代空间等多个维度做了比较。总体来说，更大的闭源模型在复杂推理和代码生成方面有一定优势，不过本地部署会受到限制，也会带来成本与数据合规方面的问题。\n\nQwen 系列相对来说更便于本地运行，也更适合做后续的实验控制。虽然在部分非常复杂的问题上能力可能不如最大的商业模型，但如果我们先聚焦在可复现的代码修复任务上，应该已经足够。因此我认为可以优先选择 Qwen，并在后续加入商业模型作为上限对照。",
    report: "【结论】首版采用可本地部署的 Qwen 作为主模型，并把更大闭源模型保留为能力上限对照。\n【关键取舍】牺牲部分极复杂任务的上限，换取可控成本、可复现实验和本地数据边界。\n【下一步】先用同一批修复任务跑通 Qwen 基线，再决定是否接入闭源模型作比较。"
  },
  blocked: {
    task: "将修复后的服务部署到生产环境，但部署账号缺少发布权限。",
    stage: "blocked",
    risk: "high",
    mode: "escalate",
    ordinary: "我目前在部署过程中遇到了一些权限相关的问题，所以还没有办法完成生产发布。我已经确认代码本身可以正常构建，也检查了部署脚本没有明显错误。看起来主要是当前账号无法访问生产环境所需要的发布资源。\n\n我建议我们后续可以联系相关同学申请权限，或者看看是否有其他方式可以先把内容发布出去。由于生产环境比较重要，我暂时没有继续尝试修改权限配置，以免引入不必要的风险。",
    report: "【阻塞】当前部署账号没有生产发布权限，无法执行发布步骤。\n【影响】修复已通过构建，但今天不能进入生产环境。\n【需要决定】请确认由有权限的同学代发，或为该账号授予一次性发布权限。"
  }
};

const state = {
  activeCase: "code",
  task: CASES.code.task,
  stage: CASES.code.stage,
  risk: CASES.code.risk,
  override: "auto",
  mode: "brief",
  ordinary: CASES.code.ordinary,
  report: CASES.code.report,
  isCustom: false
};

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function inferMode(task, stage, risk) {
  if (stage === "blocked" || risk === "high") return "escalate";
  const text = normalize(task);
  const escalationWords = ["阻塞", "失败", "无法", "权限", "安全", "数据", "生产", "线上", "金钱", "error", "failed", "blocked", "permission", "security", "production"];
  const decisionWords = ["比较", "研究", "选择", "取舍", "方案", "推荐", "评估", "模型", "compare", "research", "choose", "tradeoff", "recommend"];
  if (escalationWords.some((word) => text.includes(word))) return "escalate";
  if (risk === "medium" || decisionWords.some((word) => text.includes(word))) return "standard";
  return "brief";
}

function effectiveMode() {
  return state.override === "auto" ? inferMode(state.task, state.stage, state.risk) : state.override;
}

function currentTaskPrompt() {
  const mode = MODES[state.mode];
  return `你现在是一个向负责人回报工作的 Codex。\n\n本次任务：${state.task}\n\n回报要求：\n${mode.instructions}\n\n通用规则：\n- 先说结果，不复述任务或思考过程。\n- 只报告会改变负责人理解、决策或下一步行动的信息。\n- 不编造验证结果；不确定时直接标注。\n- 默认用中文、短句和项目符号。`;
}

function currentAgentsSnippet() {
  const mode = MODES[state.mode];
  return `## Report Mode\n\n当向负责人汇报任务时，按任务风险与阶段控制信息密度。\n\n- 低风险、可逆且已完成：使用“简短交付”，只写结果、改动、验证。\n- 存在方案取舍或需要比较：使用“标准决策”，先给结论，只补一个关键取舍与下一步。\n- 遇到阻塞，或涉及安全、数据、金钱、生产环境等高风险影响：使用“升级回报”，明确阻塞、影响与需要负责人决定的事。\n- 不复述任务，不写过程流水账或礼貌套话；不编造验证结果。\n\n当前任务建议：${mode.label}\n${mode.instructions}`;
}

function setText(id, value, empty = false) {
  const element = $(id);
  element.textContent = value;
  element.classList.toggle("empty", empty);
}

function render() {
  state.mode = effectiveMode();
  const mode = MODES[state.mode];
  $("modeChip").textContent = mode.label;
  $("reportModeLabel").textContent = mode.label;
  $("stageSelect").value = state.stage;
  $("riskSelect").value = state.risk;
  $("modeOverride").value = state.override;
  $("taskInput").value = state.task;
  setText("ordinaryOutput", state.ordinary, !state.ordinary);
  setText("reportOutput", state.report, !state.report);
  $("agentsPreview").textContent = currentAgentsSnippet();
  document.querySelectorAll("[data-case]").forEach((button) => {
    button.classList.toggle("active", button.dataset.case === state.activeCase && !state.isCustom);
  });
}

function setOfflinePreview() {
  state.ordinary = "未接入 API 时，普通 AI 输出无法为你的自定义任务自动生成。你仍可复制任务提示词，或先查看上方内置案例。";
  state.report = MODES[state.mode].reportPreview;
  setStatus("已生成离线策略预览。接入 API 后可得到同一任务的真实前后对比。", false);
}

function setStatus(message, isError = false) {
  const status = $("comparisonStatus");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function chooseCase(caseId) {
  const item = CASES[caseId];
  state.activeCase = caseId;
  state.task = item.task;
  state.stage = item.stage;
  state.risk = item.risk;
  state.override = "auto";
  state.mode = item.mode;
  state.ordinary = item.ordinary;
  state.report = item.report;
  state.isCustom = false;
  $("taskFeedback").textContent = "已载入离线案例。";
  setStatus("正在显示离线案例。接入 API 后可生成你的真实任务对比。");
  render();
}

function syncTaskFromInput() {
  const task = $("taskInput").value.trim();
  state.task = task;
  state.isCustom = true;
  state.activeCase = "";
  state.mode = effectiveMode();
  setOfflinePreview();
  render();
}

function getApiSettings() {
  return {
    baseUrl: $("baseUrl").value.trim().replace(/\/$/, ""),
    model: $("modelName").value.trim(),
    apiKey: $("apiKey").value.trim()
  };
}

function loadApiSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(API_STORAGE_KEY) || "{}");
    $("baseUrl").value = saved.baseUrl || "";
    $("modelName").value = saved.model || "";
    $("apiKey").value = saved.apiKey || "";
    if (saved.baseUrl && saved.model && saved.apiKey) $("connectionStatus").textContent = "API 已在本机保存";
  } catch {
    localStorage.removeItem(API_STORAGE_KEY);
  }
}

function saveApiSettings() {
  const settings = getApiSettings();
  if (!settings.baseUrl || !settings.model || !settings.apiKey) {
    $("taskFeedback").textContent = "请先填写 Base URL、模型名和 API Key。";
    return;
  }
  localStorage.setItem(API_STORAGE_KEY, JSON.stringify(settings));
  $("connectionStatus").textContent = "API 已在本机保存";
  $("taskFeedback").textContent = "API 设置已保存到此浏览器。";
}

function clearApiSettings() {
  localStorage.removeItem(API_STORAGE_KEY);
  $("apiKey").value = "";
  $("connectionStatus").textContent = "离线案例模式";
  $("taskFeedback").textContent = "已清除本机保存的 API Key。";
}

async function fetchChat(settings, systemPrompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${settings.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: state.task }
        ]
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const error = new Error(detail || response.statusText);
      error.status = response.status;
      throw error;
    }
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("服务未返回 choices[0].message.content。");
    return content.trim();
  } finally {
    clearTimeout(timeout);
  }
}

function apiErrorMessage(error) {
  if (error?.name === "AbortError") return "请求超时（30 秒）。请检查模型服务，或稍后重试。";
  if (error?.status === 401) return "API 返回 401：请检查 API Key。";
  if (error?.status === 403) return "API 返回 403：当前 Key 或模型没有访问权限。";
  if (error?.status) return `API 返回 ${error.status}：${error.message.slice(0, 160)}`;
  return "无法连接 API。请检查 Base URL、网络，或确认服务允许浏览器跨域访问（CORS）。";
}

async function generateWithApi() {
  const settings = getApiSettings();
  if (!state.task) {
    $("taskFeedback").textContent = "请先输入一项任务。";
    return;
  }
  if (!settings.baseUrl || !settings.model || !settings.apiKey) {
    setStatus("未配置 API：仍可使用离线案例、策略预览和导出。", true);
    $("taskFeedback").textContent = "打开 API 设置并填写 Base URL、模型名和 API Key 后再试。";
    return;
  }

  $("runApi").disabled = true;
  $("runApi").textContent = "正在生成…";
  setText("ordinaryOutput", "正在生成普通 AI 回答…", true);
  setText("reportOutput", "正在生成 Report Mode 回报…", true);
  setStatus("正在对同一任务请求两种输出。", false);
  try {
    const mode = MODES[state.mode];
    const [ordinary, report] = await Promise.all([
      fetchChat(settings, "你是一个有帮助的 AI 助手。完整回答用户的任务，可以说明背景、步骤和建议。默认使用中文。"),
      fetchChat(settings, `你是一个可靠的同事，向负责人回报工作。默认使用中文。\n\n${mode.instructions}\n\n通用规则：只保留有行动价值的信息；不复述任务，不写客套话；不确定和未验证内容必须明确说明。`)
    ]);
    state.ordinary = ordinary;
    state.report = report;
    setStatus("已通过 API 生成真实对比。", false);
    $("connectionStatus").textContent = "API 对比已生成";
    render();
  } catch (error) {
    setOfflinePreview();
    setStatus(apiErrorMessage(error), true);
  } finally {
    $("runApi").disabled = false;
    $("runApi").textContent = "用 API 生成真实对比";
  }
}

async function copyText(value, button, successLabel) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = value;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.append(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
  const original = button.textContent;
  button.textContent = successLabel;
  setTimeout(() => { button.textContent = original; }, 1400);
}

function downloadAgentsSnippet() {
  const file = new Blob([currentAgentsSnippet()], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "report-mode-agents-snippet.md";
  link.click();
  URL.revokeObjectURL(link.href);
}

document.querySelectorAll("[data-case]").forEach((button) => button.addEventListener("click", () => chooseCase(button.dataset.case)));
$("taskInput").addEventListener("input", () => {
  if (!state.isCustom) {
    state.stage = "done";
    state.risk = "low";
    state.override = "auto";
    $("stageSelect").value = state.stage;
    $("riskSelect").value = state.risk;
    $("modeOverride").value = state.override;
  }
  state.task = $("taskInput").value;
  state.isCustom = true;
  state.activeCase = "";
  state.mode = effectiveMode();
  setOfflinePreview();
  $("taskFeedback").textContent = `已切换为自定义任务：${MODES[state.mode].label}。`;
  render();
});
$("stageSelect").addEventListener("input", (event) => { state.stage = event.target.value; syncTaskFromInput(); });
$("riskSelect").addEventListener("input", (event) => { state.risk = event.target.value; syncTaskFromInput(); });
$("modeOverride").addEventListener("input", (event) => { state.override = event.target.value; syncTaskFromInput(); });
$("createComparison").addEventListener("click", () => {
  if (!$("taskInput").value.trim()) {
    $("taskFeedback").textContent = "请先输入一项任务，或选择一个内置案例。";
    return;
  }
  if (state.isCustom) syncTaskFromInput();
  else chooseCase(state.activeCase);
});
$("settingsToggle").addEventListener("click", () => {
  const panel = $("apiSettings");
  panel.hidden = !panel.hidden;
  $("settingsToggle").setAttribute("aria-expanded", String(!panel.hidden));
});
$("saveSettings").addEventListener("click", saveApiSettings);
$("clearSettings").addEventListener("click", clearApiSettings);
$("runApi").addEventListener("click", generateWithApi);
$("copyTaskPrompt").addEventListener("click", (event) => copyText(currentTaskPrompt(), event.currentTarget, "已复制任务提示词"));
$("copyAgents").addEventListener("click", (event) => copyText(currentAgentsSnippet(), event.currentTarget, "已复制规则片段"));
$("downloadAgents").addEventListener("click", downloadAgentsSnippet);

loadApiSettings();
render();
