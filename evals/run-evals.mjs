#!/usr/bin/env node
import { CASES } from "../demo/cases.mjs";
import { evaluateCase, summarize } from "./scoring.mjs";

const results = CASES.map(evaluateCase);
const summary = summarize(results);
const formatIndex = process.argv.indexOf("--format");
const format = formatIndex === -1 ? "markdown" : process.argv[formatIndex + 1];

if (!new Set(["markdown", "json"]).has(format)) {
  process.stderr.write("evals: --format must be markdown or json\n");
  process.exit(1);
}

if (format === "json") {
  process.stdout.write(`${JSON.stringify({ summary, results }, null, 2)}\n`);
} else {
  const percent = (value) => `${Math.round(value * 100)}%`;
  const lines = [
    "# Report Mode evaluation",
    "",
    `- Cases: ${summary.cases}`,
    `- Harness mode accuracy: ${percent(summary.mode_accuracy)}`,
    "",
    "| Variant | Required info | Unsupported claims | Irrelevant info | Action clarity |",
    "| --- | ---: | ---: | ---: | ---: |"
  ];
  for (const [key, value] of Object.entries(summary.variants)) {
    lines.push(`| ${key} | ${percent(value.coverage)} | ${value.unsupported_claims} | ${percent(value.irrelevant_ratio)} | ${percent(value.action_clarity)} |`);
  }
  lines.push("", "## Cases", "");
  for (const result of results) {
    lines.push(`- ${result.id}: ${result.actual_mode} ${result.mode_match ? "✓" : "✗"}${result.missing_evidence.length ? `; missing ${result.missing_evidence.join(", ")}` : ""}`);
  }
  process.stdout.write(`${lines.join("\n")}\n`);
}
