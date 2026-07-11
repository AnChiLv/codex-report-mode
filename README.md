# Report Mode

> Make AI report like a reliable teammate.

一个零依赖、可部署到 GitHub Pages 的 AI 输出策略工作台。它不追求把所有回答压得越短越好，而是让 AI 按任务阶段和影响范围选择合适的信息密度：小改动短报、有取舍则说明原因、遇到风险或阻塞则明确升级。

## What it demonstrates

Report Mode treats an AI response as a work report instead of a generic answer:

| Mode | When to use it | Required information |
| --- | --- | --- |
| Brief delivery | Small, reversible work is complete | Result, change, verification |
| Standard decision | A choice or trade-off matters | Recommendation, one key trade-off, next step |
| Escalated report | Work is blocked or risk is high | Blocker, impact, decision needed |

The demo includes three offline examples and a custom-task workflow. For a custom task it recommends a mode locally, lets the user adjust it, and exports a Codex prompt or an `AGENTS.md` snippet.

With an OpenAI-compatible API, it can also generate two live outputs for the same task: a normal AI response and a Report Mode response.

## Run locally

This is a static site with no build step. Open `index.html` in a browser, or serve this directory with any static server.

## Optional API mode

Open **API 设置** and enter:

- **Base URL** — for example `https://api.example.com/v1`
- **Model name**
- **API Key**

The app calls `${Base URL}/chat/completions` using the OpenAI Chat Completions format. This makes it compatible with services such as OpenAI, Qwen, DeepSeek, or a compatible gateway when that service allows browser CORS requests.

The API key is stored only in the current browser's `localStorage`. It is never committed, sent to this repository, or routed through a backend. Use **清除本机密钥** to remove it.

> Direct browser API calls will fail if the selected provider blocks CORS. That is expected for some services. The v1 fallback is the offline demo and rule export; a future version can add a local proxy that reads an environment variable instead.

## Use with Codex

The export area provides two outputs:

1. **Current task prompt** — paste it into a single Codex task.
2. **`AGENTS.md` snippet** — merge the `## Report Mode` section into an existing project policy. It never asks you to replace your existing file.

## Deploy to GitHub Pages

1. Create a GitHub repository and push these files to its default branch.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select the default branch and the repository root.
4. Open the generated Pages URL.

No server-side environment variables or build commands are required.

## Architecture

```text
task text / built-in example
        ↓
local mode recommendation + optional manual adjustment
        ↓
offline comparison preview ── or ── two compatible API requests
        ↓
task prompt + mergeable AGENTS.md snippet
```

## 中文说明

### 它解决什么问题？

普通 AI 常把背景、过程、客套话和真正需要负责人知道的信息混在一起。Report Mode 不只做“摘要”，而是根据任务上下文决定应该以哪种工作回报形式输出：

- **简短交付**：只写结果、改动和验证。
- **标准决策**：先给推荐，再补一个真正影响选择的取舍。
- **升级回报**：明确阻塞、影响以及需要负责人决定的事情。

### 离线与 API

三个内置案例无需联网即可运行。输入自己的任务时，页面会在本地推荐回报方式，并生成可复制的 Codex 提示词和 `AGENTS.md` 规则片段。

配置 OpenAI 兼容 API 后，页面会对同一任务请求两次：一次普通回答，一次按 Report Mode 规则回报，并列展示结果。Key 按浏览器设置保存在本机，可随时清除；项目没有后端，也不会接收 Key。

## Future ideas

- Local proxy mode for providers without browser CORS support
- Team-level saved report policies
- Response linting: detect repetition, unverifiable claims, and missing decisions

## License

MIT
