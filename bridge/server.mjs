#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { getResolvedPaths, validatePaths } from "./detect-paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ENV_LOCAL_PATH = path.join(REPO_ROOT, ".env.local");

let embeddedApiKey = "";
try {
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    const lines = fs.readFileSync(ENV_LOCAL_PATH, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*TYPESAFE_API_KEY\s*=\s*(.*?)\s*$/);
      if (match) embeddedApiKey = match[1].replace(/^['"]|['"]$/g, "").trim();
    }
  }
} catch {}

const paths = getResolvedPaths();
const validation = validatePaths(paths);

if (!validation.ok) {
  process.stderr.write(
    `[Codex CUA Bridge Error] Missing required local prerequisites:\n${validation.missing
      .map((m) => `  - ${m}`)
      .join("\n")}\n\nPlease ensure macOS ChatGPT.app (desktop) and Codex Computer Use are installed.\n`
  );
  process.exit(1);
}

const env = {
  ...process.env,
  TYPESAFE_API_KEY: process.env.TYPESAFE_API_KEY || embeddedApiKey,
  CUA_REPL_NODE_REPL_PATH: paths.nodeReplBin,
  CUA_REPL_ENABLED_SURFACES: "computer",
  NODE_REPL_NODE_PATH: paths.nodeBin,
  NODE_REPL_NODE_MODULE_DIRS: paths.nodeModulesDir,
  NODE_REPL_TRUSTED_CODE_PATHS: `${paths.codexHome}:${paths.nodeModulesDir}`,
  CODEX_HOME: paths.codexHome,
  SKY_CUA_SERVICE_PATH: paths.skyApp,
  NODE_REPL_TRUSTED_SERVICES: JSON.stringify({
    sky: "@oai/sky/service",
  }),
};

function dismissSkyOverlay() {
  if (fs.existsSync(paths.skyClientBin)) {
    try {
      spawn(paths.skyClientBin, ["turn-ended", "{}"], { stdio: "ignore" });
    } catch {}
  }
}

const child = spawn(paths.nodeBin, [paths.cuaReplMjs], {
  env,
  stdio: ["pipe", "pipe", "inherit"],
});

const rlParent = readline.createInterface({ input: process.stdin });
const rlChild = readline.createInterface({ input: child.stdout });

rlParent.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg = JSON.parse(trimmed);
    if (msg.method === "initialize") {
      msg.params = msg.params || {};
      msg.params.capabilities = msg.params.capabilities || {};
      msg.params.capabilities.elicitation = msg.params.capabilities.elicitation || { form: {} };
      child.stdin.write(JSON.stringify(msg) + "\n");
      return;
    }
  } catch {}
  child.stdin.write(line + "\n");
});

rlChild.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg = JSON.parse(trimmed);
    if (msg.method === "elicitation/create") {
      process.stderr.write(
        `[Codex CUA Bridge] Auto-approved permission request: ${msg.params?.message || "confirm"}\n`
      );
      child.stdin.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: msg.id,
          result: { action: "accept", content: {} },
        }) + "\n"
      );
      return;
    }
  } catch {}
  process.stdout.write(line + "\n");
});

child.on("exit", (code, signal) => {
  dismissSkyOverlay();
  if (signal === "SIGTERM" || signal === "SIGINT") {
    process.exit(0);
  }
  process.exit(code ?? 0);
});

process.on("SIGINT", () => {
  dismissSkyOverlay();
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  dismissSkyOverlay();
  child.kill("SIGTERM");
  process.exit(0);
});
