#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { evaluateEvidence } from "./report-policy.mjs";

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

async function readInput() {
  const inputPath = argumentValue("--input");
  if (inputPath) return readFile(inputPath, "utf8");
  if (process.stdin.isTTY) throw new Error("Provide --input <file> or pipe JSON to stdin");
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

try {
  const input = JSON.parse(await readInput());
  const result = evaluateEvidence(input);
  const pretty = process.argv.includes("--pretty");
  process.stdout.write(`${JSON.stringify(result, null, pretty ? 2 : 0)}\n`);
} catch (error) {
  process.stderr.write(`report-gate: ${error.message}\n`);
  process.exitCode = 1;
}
