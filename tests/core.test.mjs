import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseAX,
  selectCandidates,
  buildContext,
} from "../jev/loop.mjs";
import {
  evaluatePolicy,
  matchSensitive,
  DEFAULT_THRESHOLDS,
} from "../jev/policy.mjs";
import {
  buildQuestions,
  normalizeDecision,
  sanitizeLabel,
} from "../jev/decide.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "../fixtures/ax");

function readFixture(name) {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");
}

test("parseAX parses element indices, roles, and labels correctly", () => {
  const ax = readFixture("calculator.txt");
  const nodes = parseAX(ax);
  assert(nodes.length > 20, "Should extract more than 20 nodes");
  const seven = nodes.find((n) => n.index === 9);
  assert.equal(seven?.role, "button");
  assert.match(seven?.label, /7/);
});

test("selectCandidates preserves actionable buttons even in dense views", () => {
  const ax = readFixture("calculator.txt");
  const nodes = parseAX(ax);
  const candidates = selectCandidates(nodes, { max: 40 });
  assert(candidates.length <= 40);
  const labels = candidates.map((c) => c.label).join(" ");
  assert.match(labels, /All Clear/);
  assert.match(labels, /Add/);
});

test("policy gate handles done, risk, and sensitive labels", () => {
  const doneResult = evaluatePolicy({
    decision: { done: 0.95 },
    app: "Calculator",
  });
  assert.equal(doneResult.verdict, "done");

  const sensitiveResult = evaluatePolicy({
    decision: { targetLabel: "删除该文件", risk: 0.1 },
    app: "TextEdit",
  });
  assert.equal(sensitiveResult.verdict, "confirm");

  const unlistedApp = evaluatePolicy({
    decision: { done: 0.1, risk: 0.05, confidence: 0.9 },
    app: "UntrustedBrowserApp",
  });
  assert.equal(unlistedApp.verdict, "confirm");
});

test("sanitizeLabel removes noisy URLs and normalizes whitespace", () => {
  const dirty = "Button https://malicious.example.com/api/test   Click Here   ";
  const clean = sanitizeLabel(dirty);
  assert.equal(clean, "Button Click Here");
});

test("buildQuestions and normalizeDecision stay consistent", () => {
  const candidates = [
    { index: 1, role: "button", label: "OK" },
    { index: 2, role: "button", label: "Cancel" },
  ];
  const q = buildQuestions("Click OK", candidates);
  assert.equal(q.criteria.i1, "button: OK");
  assert.equal(q.criteria.i2, "button: Cancel");

  const norm = normalizeDecision(
    {
      target: { choice: "i1", confidence: 0.95 },
      action: { choice: "click_element" },
      done: { noul: 0.1 },
      risk: { noul: 0.05 },
    },
    q.criteria
  );
  assert.equal(norm.targetKey, "i1");
  assert.equal(norm.targetIndex, 1);
  assert.equal(norm.confidence, 0.95);
});
