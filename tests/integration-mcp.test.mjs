import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRIDGE_PATH = path.resolve(__dirname, "../bridge/server.mjs");

test("end-to-end: bridge server handles MCP initialize, tools/list, and real CUA js call", async (t) => {
  const child = spawn("node", [BRIDGE_PATH], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  const rl = readline.createInterface({ input: child.stdout });

  const messages = [];
  rl.on("line", (line) => {
    if (!line.trim()) return;
    try {
      messages.push(JSON.parse(line));
    } catch {}
  });

  function send(msg) {
    child.stdin.write(JSON.stringify(msg) + "\n");
  }

  // 1. Send initialize with elicitation capability
  send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {
        elicitation: { form: {} },
      },
      clientInfo: { name: "integration-tester", version: "1.0.0" },
    },
  });

  // Wait for init response
  await new Promise((resolve, reject) => {
    const check = setInterval(() => {
      const initResp = messages.find((m) => m.id === 1);
      if (initResp) {
        clearInterval(check);
        assert.ok(initResp.result?.serverInfo?.name);
        resolve();
      }
    }, 50);
    setTimeout(() => {
      clearInterval(check);
      reject(new Error("Timeout waiting for MCP initialize response"));
    }, 5000);
  });

  // 2. Send notifications/initialized and tools/list
  send({ jsonrpc: "2.0", method: "notifications/initialized" });
  send({ jsonrpc: "2.0", id: 2, method: "tools/list" });

  // Wait for tools/list response
  await new Promise((resolve, reject) => {
    const check = setInterval(() => {
      const toolsResp = messages.find((m) => m.id === 2);
      if (toolsResp) {
        clearInterval(check);
        const toolNames = toolsResp.result?.tools?.map((t) => t.name) || [];
        assert.ok(toolNames.includes("js"), "tools/list must include js tool");
        resolve();
      }
    }, 50);
    setTimeout(() => {
      clearInterval(check);
      reject(new Error("Timeout waiting for MCP tools/list response"));
    }, 5000);
  });

  // 3. Send real tools/call for js tool to read cua state
  send({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "js",
      arguments: {
        code: `
          let state = await cua.getState({ emit: false });
          nodeRepl.write({ success: true, appCount: state.apps.length });
        `,
      },
    },
  });

  // Wait for tools/call response
  await new Promise((resolve, reject) => {
    const check = setInterval(() => {
      const callResp = messages.find((m) => m.id === 3);
      if (callResp) {
        clearInterval(check);
        assert.equal(callResp.result?.isError, false, "tools/call should succeed");
        const writtenText = callResp.result?.content?.map((c) => c.text).join("\n") || "";
        assert.match(writtenText, /success:\s*true/, "CUA output should report success");
        resolve();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(check);
      reject(new Error("Timeout waiting for tools/call response"));
    }, 15000);
  });

  // 4. Clean shutdown test: ensure child exits with code 0 on SIGTERM
  const exitPromise = new Promise((resolve) => {
    child.on("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });

  child.kill("SIGTERM");
  const exitStatus = await exitPromise;
  assert.equal(exitStatus.code, 0, "Process should exit with code 0 on SIGTERM");
});
