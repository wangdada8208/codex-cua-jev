import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseAX,
  selectCandidates,
  buildContext,
  runTask,
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

const CALENDAR_AX = readFixture("calendar-month.txt");

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

test("selectCandidates with goal prioritizing relevant buttons", () => {
  const els = parseAX(CALENDAR_AX);
  const candidates = selectCandidates(els, "previous month", { max: 3 });
  assert.ok(candidates.map((c) => c.index).includes(56));
});

test("buildContext extracts compact state with key tokens", () => {
  const ctx = buildContext(CALENDAR_AX);
  assert.ok(ctx.includes("Calendar"));
  assert.ok(ctx.includes("September 2026"));
  assert.ok(ctx.split("\n").length <= 9);

  const calcAx = ['Window: "Calculator", App: Calculator.', '0 standard window Calculator', '\t4 text ‎42', '\t24 button Equals'].join("\n");
  const calcCtx = buildContext(calcAx);
  assert.ok(calcCtx.includes("42"));
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

test("policy: confidence thresholds and low risk apps", () => {
  const stop = evaluatePolicy({ decision: { done: 0.1, risk: 0.01, confidence: 0.2, targetIndex: 1 }, app: "Calendar" });
  assert.equal(stop.verdict, "stop");

  const esc = evaluatePolicy({ decision: { done: 0.1, risk: 0.01, confidence: 0.35, targetIndex: 1 }, app: "Calendar" });
  assert.equal(esc.verdict, "escalate");

  const calc = evaluatePolicy({ decision: { done: 0.1, risk: 0.03, confidence: 0.46, targetIndex: 24, targetLabel: "button: Equals" }, app: "Calculator" });
  assert.equal(calc.verdict, "proceed");
});

test("matchSensitive detects payments, sends, and auth triggers", () => {
  assert.equal(matchSensitive("button 立即支付").id, "payment");
  assert.equal(matchSensitive("button Send message").id, "send");
  assert.equal(matchSensitive("button Search"), null);
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

async function mockRun(options) {
  const traceDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-test-"));
  try {
    return await runTask({ appName: "Calendar", goal: "next month", emit: () => {}, traceDir, ...options });
  } finally {
    fs.rmSync(traceDir, { recursive: true, force: true });
  }
}

test("Planner preview executes without side effects and passes control", async () => {
  let clicked = false;
  const driver = {
    getAX: async () => CALENDAR_AX,
    click: async () => { clicked = true; },
  };
  const ask = async () => ({
    answers: {
      target: { choice: "i56", confidence: 1 },
      action: { choice: "click_element" },
      done: { noul: 0.01 },
      risk: { noul: 0.01 },
    },
    usage: { input_tokens: 100 },
  });

  const res = await mockRun({ driver, ask, dryRun: true, maxSteps: 1 });
  assert.equal(res.status, "dry_run");
  assert.equal(clicked, false, "dryRun 严禁实际下发 click");
  assert.equal(res.steps.length, 1);
  assert.equal(res.steps[0].executed, false);
});

test("task completes when state verify function succeeds", async () => {
  let step = 0;
  const driver = {
    getAX: async () => {
      step++;
      return step >= 2
        ? CALENDAR_AX.replace("September 2026", "October 2026")
        : CALENDAR_AX;
    },
    click: async () => {},
  };
  const ask = async () => ({
    answers: {
      target: { choice: "i58", confidence: 1 },
      action: { choice: "click_element" },
      done: { noul: 0.05 },
      risk: { noul: 0.01 },
    },
    usage: { input_tokens: 100 },
  });

  const res = await mockRun({
    driver,
    ask,
    dryRun: false,
    maxSteps: 3,
    verify: (ax) => ax.includes("October 2026"),
  });
  assert.equal(res.status, "done");
  assert.equal(res.verified, true);
});
