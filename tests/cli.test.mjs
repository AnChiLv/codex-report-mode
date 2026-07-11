import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const cli = fileURLToPath(new URL("../skills/adaptive-work-report/scripts/report-gate.mjs", import.meta.url));

test("CLI returns JSON for valid input", async () => {
  const directory = await mkdtemp(join(tmpdir(), "report-mode-"));
  const inputPath = join(directory, "input.json");
  await writeFile(inputPath, JSON.stringify({
    task_summary: "Verified task",
    status: "completed",
    risk: "low",
    evidence: [{ type: "test", label: "tests", result: "passed" }],
    changed_scope: ["app"],
    open_questions: [],
    human_decision_needed: false
  }));
  const result = spawnSync(process.execPath, [cli, "--input", inputPath], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).mode, "brief");
});

test("CLI exits non-zero for invalid input", async () => {
  const directory = await mkdtemp(join(tmpdir(), "report-mode-"));
  const inputPath = join(directory, "invalid.json");
  await writeFile(inputPath, JSON.stringify({ status: "completed" }));
  const result = spawnSync(process.execPath, [cli, "--input", inputPath], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /report-gate:/);
});
