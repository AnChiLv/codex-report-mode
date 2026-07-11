export const CASES = [
  {
    id: "code-verified",
    category: "代码修复",
    title: "移动端支付按钮",
    subtitle: "低风险 · 已验证",
    showcase: true,
    expected_mode: "brief",
    input: {
      task_summary: "修复移动端确认支付按钮被遮挡、无法点击的问题",
      status: "completed",
      risk: "low",
      evidence: [
        { type: "test", label: "移动端点击与下单前流程", result: "passed" },
        { type: "inspection", label: "桌面端按钮布局未变化", result: "observed" }
      ],
      changed_scope: ["支付按钮点击区域", "移动端遮挡层级"],
      open_questions: [],
      human_decision_needed: false
    },
    reviewer: null,
    facts: {
      result: "移动端确认支付按钮已恢复响应。",
      changes: "调整遮挡层级与点击区域，未改动支付流程。",
      verification: "移动端点击与下单前流程通过；桌面端布局已检查。",
      risks: "未执行实体设备回归。",
      next_step: "按正常发布流程进入回归。",
      blocker: "无。",
      impact: "局部 UI 修复。",
      decision: "无需人工决定。"
    },
    outputs: {
      baseline: "我已经对支付页面进行了比较完整的排查。首先查看了移动端与桌面端事件绑定差异，也尝试了几种 CSS 调整方式。最终确认是一层容器影响了按钮点击，因此修改了层级和点击区域。目前看起来已经解决，后续建议测试同学再多检查一些设备。",
      promptOnly: "支付按钮问题已修复。调整了移动端层级和点击区域，并进行了相关测试。",
      system: "【结果】移动端确认支付按钮已恢复响应。\n【改动】调整遮挡层级与点击区域，未改动支付流程。\n【验证】移动端点击与下单前流程通过；桌面端布局已检查。"
    },
    annotations: {
      baseline: { covered_sections: ["result", "changes"], unsupported_claims: 1, irrelevant_units: 3, total_units: 5, action_clear: true },
      promptOnly: { covered_sections: ["result", "changes"], unsupported_claims: 1, irrelevant_units: 0, total_units: 2, action_clear: true },
      system: { covered_sections: ["result", "changes", "verification"], unsupported_claims: 0, irrelevant_units: 0, total_units: 3, action_clear: true }
    }
  },
  {
    id: "research-tradeoff",
    category: "研究取舍",
    title: "本地模型方案",
    subtitle: "中风险 · 条件复核",
    showcase: true,
    expected_mode: "standard",
    input: {
      task_summary: "比较本地 Qwen 与闭源大模型作为代码修复助手的取舍",
      status: "completed",
      risk: "medium",
      evidence: [
        { type: "source", label: "两类模型的部署与许可资料", result: "observed" },
        { type: "artifact", label: "同一批修复任务对比表", result: "observed" }
      ],
      changed_scope: ["首版模型选择建议", "后续对照实验计划"],
      open_questions: ["复杂修复任务的能力差距仍需扩大样本验证"],
      human_decision_needed: false
    },
    reviewer: {
      verdict: "pass",
      findings: ["本地部署与实验可复现性证据充分", "能力上限结论保持为待验证项"],
      missing_evidence: []
    },
    facts: {
      result: "首版采用可本地部署的 Qwen，闭源模型保留为上限对照。",
      changes: "形成模型选择建议与对照实验计划。",
      verification: "已核对部署资料，并完成同批修复任务对比表。",
      risks: "复杂任务的能力差距仍缺少大样本证据。",
      next_step: "扩大复杂修复样本后再决定是否引入闭源主模型。",
      blocker: "无。",
      impact: "影响首版实验的成本、复现性和能力上限。",
      decision: "无需立即决定。"
    },
    outputs: {
      baseline: "关于模型选择，我从能力、部署难度、成本、上下文长度、工具调用和后续扩展等多个维度进行了比较。闭源模型通常在复杂推理上更强，不过会带来成本和数据边界问题。Qwen 更便于本地实验，因此我倾向于先采用 Qwen。未来可以继续增加更多测试，并在有需要时接入闭源模型。",
      promptOnly: "建议首版使用 Qwen，因为更容易本地部署和复现实验。闭源模型能力更强，可留作后续对照。",
      system: "【结果】首版采用可本地部署的 Qwen，闭源模型保留为上限对照。\n【验证】已核对部署资料，并完成同批修复任务对比表。\n【风险】复杂任务的能力差距仍缺少大样本证据。\n【下一步】扩大复杂修复样本后再决定是否引入闭源主模型。"
    },
    annotations: {
      baseline: { covered_sections: ["result", "risks"], unsupported_claims: 2, irrelevant_units: 3, total_units: 6, action_clear: false },
      promptOnly: { covered_sections: ["result", "risks"], unsupported_claims: 1, irrelevant_units: 0, total_units: 2, action_clear: false },
      system: { covered_sections: ["result", "verification", "risks", "next_step"], unsupported_claims: 0, irrelevant_units: 0, total_units: 4, action_clear: true }
    }
  },
  {
    id: "deploy-blocked",
    category: "阻塞升级",
    title: "生产发布权限",
    subtitle: "高风险 · 人工决定",
    showcase: true,
    expected_mode: "escalate",
    input: {
      task_summary: "将修复后的服务部署到生产环境",
      status: "blocked",
      risk: "high",
      evidence: [
        { type: "test", label: "构建与部署前检查", result: "passed" },
        { type: "inspection", label: "部署账号生产权限", result: "observed" }
      ],
      changed_scope: ["生产部署"],
      open_questions: ["由有权限同学代发，还是授予一次性权限"],
      human_decision_needed: true
    },
    reviewer: {
      verdict: "escalate",
      findings: ["构建证据充分", "继续修改权限配置会扩大生产风险"],
      missing_evidence: []
    },
    facts: {
      result: "修复已构建，但尚未发布。",
      changes: "生产发布未执行。",
      verification: "构建与部署前检查通过。",
      risks: "擅自调整生产权限会扩大影响范围。",
      next_step: "等待负责人选择发布路径。",
      blocker: "当前部署账号没有生产发布权限。",
      impact: "修复今天无法进入生产环境。",
      decision: "请决定由有权限同学代发，或授予一次性发布权限。"
    },
    outputs: {
      baseline: "部署过程中遇到了一些权限问题，目前还没有完成生产发布。我已经检查了代码和部署脚本，暂时没有发现明显问题。建议之后联系相关同学申请权限，或者看看有没有其他发布方式。因为生产环境比较重要，我没有继续尝试修改配置。",
      promptOnly: "部署因权限问题未完成。代码已构建，请联系有权限的同学处理。",
      system: "【阻塞】当前部署账号没有生产发布权限。\n【影响】修复今天无法进入生产环境。\n【需要决定】请决定由有权限同学代发，或授予一次性发布权限。"
    },
    annotations: {
      baseline: { covered_sections: ["blocker", "impact"], unsupported_claims: 1, irrelevant_units: 2, total_units: 5, action_clear: false },
      promptOnly: { covered_sections: ["blocker", "impact"], unsupported_claims: 0, irrelevant_units: 0, total_units: 2, action_clear: false },
      system: { covered_sections: ["blocker", "impact", "decision"], unsupported_claims: 0, irrelevant_units: 0, total_units: 3, action_clear: true }
    }
  },
  {
    id: "code-unverified",
    category: "代码修复",
    title: "未运行回归测试",
    subtitle: "低风险 · 证据不足",
    showcase: false,
    expected_mode: "standard",
    input: {
      task_summary: "修复设置页保存按钮的禁用状态",
      status: "completed",
      risk: "low",
      evidence: [{ type: "test", label: "设置页回归", result: "not_run" }],
      changed_scope: ["设置页保存按钮"],
      open_questions: [],
      human_decision_needed: false
    },
    reviewer: { verdict: "revise", findings: ["完成结论缺少执行过的验证"], missing_evidence: ["设置页回归"] },
    facts: { result: "按钮逻辑已修改。", changes: "调整禁用条件。", verification: "设置页回归未运行。", risks: "可能存在状态组合回归。", next_step: "运行设置页回归后再宣称完成。", blocker: "无。", impact: "完成结论尚不可靠。", decision: "无需人工决定。" },
    outputs: {
      baseline: "设置页按钮问题已经修复完成，逻辑现在应该可以正常工作。",
      promptOnly: "已修复设置页保存按钮的禁用状态。",
      system: "【结果】按钮逻辑已修改，但不能判定为已验证完成。\n【验证】设置页回归未运行。\n【风险】可能存在状态组合回归。\n【下一步】运行设置页回归后再宣称完成。"
    },
    annotations: {
      baseline: { covered_sections: ["result"], unsupported_claims: 1, irrelevant_units: 0, total_units: 1, action_clear: false },
      promptOnly: { covered_sections: ["result"], unsupported_claims: 1, irrelevant_units: 0, total_units: 1, action_clear: false },
      system: { covered_sections: ["result", "verification", "risks", "next_step"], unsupported_claims: 0, irrelevant_units: 0, total_units: 4, action_clear: true }
    }
  },
  {
    id: "research-partial",
    category: "研究取舍",
    title: "来源覆盖不完整",
    subtitle: "部分完成 · 开放问题",
    showcase: false,
    expected_mode: "standard",
    input: {
      task_summary: "比较两种代码检索方案的延迟与准确率",
      status: "partial",
      risk: "low",
      evidence: [{ type: "source", label: "方案 A 官方基准", result: "observed" }],
      changed_scope: ["初步比较表"],
      open_questions: ["方案 B 缺少同硬件基准"],
      human_decision_needed: false
    },
    reviewer: { verdict: "pass", findings: ["部分完成标记正确"], missing_evidence: ["方案 B 同硬件基准"] },
    facts: { result: "已形成初步比较，尚不能给最终推荐。", changes: "整理方案 A 基准。", verification: "方案 A 官方基准已核对。", risks: "方案 B 数据不可直接比较。", next_step: "补齐同硬件基准。", blocker: "无。", impact: "当前推荐可能偏置。", decision: "无需人工决定。" },
    outputs: {
      baseline: "从已有数据看，方案 A 似乎在延迟方面更有优势，可以优先考虑。",
      promptOnly: "方案 A 延迟更低，但还需补充方案 B 数据。",
      system: "【结果】已形成初步比较，尚不能给最终推荐。\n【验证】方案 A 官方基准已核对。\n【风险】方案 B 数据不可直接比较。\n【下一步】补齐同硬件基准。"
    },
    annotations: {
      baseline: { covered_sections: ["result"], unsupported_claims: 1, irrelevant_units: 0, total_units: 1, action_clear: false },
      promptOnly: { covered_sections: ["result", "risks"], unsupported_claims: 0, irrelevant_units: 0, total_units: 2, action_clear: true },
      system: { covered_sections: ["result", "verification", "risks", "next_step"], unsupported_claims: 0, irrelevant_units: 0, total_units: 4, action_clear: true }
    }
  },
  {
    id: "ops-decision",
    category: "阻塞升级",
    title: "迁移窗口选择",
    subtitle: "需要人工决定",
    showcase: false,
    expected_mode: "escalate",
    input: {
      task_summary: "安排数据库迁移窗口",
      status: "partial",
      risk: "medium",
      evidence: [{ type: "artifact", label: "迁移演练记录", result: "observed" }],
      changed_scope: ["生产迁移计划"],
      open_questions: ["选择工作日短窗口或周末长窗口"],
      human_decision_needed: true
    },
    reviewer: { verdict: "escalate", findings: ["两种窗口影响不同，需业务负责人确认"], missing_evidence: [] },
    facts: { result: "迁移演练完成。", changes: "形成两个窗口方案。", verification: "迁移演练记录已检查。", risks: "窗口选择影响停机时间与值守成本。", next_step: "负责人选择窗口。", blocker: "生产窗口尚未确定。", impact: "无法锁定发布与值守安排。", decision: "请选择工作日短窗口或周末长窗口。" },
    outputs: {
      baseline: "迁移方案已经准备得差不多了。现在有工作日和周末两个时间选择，各有优缺点，需要大家再讨论一下。",
      promptOnly: "迁移演练完成，请确认迁移时间。",
      system: "【阻塞】生产窗口尚未确定。\n【影响】无法锁定发布与值守安排。\n【需要决定】请选择工作日短窗口或周末长窗口。"
    },
    annotations: {
      baseline: { covered_sections: ["blocker"], unsupported_claims: 1, irrelevant_units: 1, total_units: 2, action_clear: false },
      promptOnly: { covered_sections: ["impact", "decision"], unsupported_claims: 0, irrelevant_units: 0, total_units: 2, action_clear: true },
      system: { covered_sections: ["blocker", "impact", "decision"], unsupported_claims: 0, irrelevant_units: 0, total_units: 3, action_clear: true }
    }
  }
];

export const SHOWCASE_CASES = CASES.filter((item) => item.showcase);
