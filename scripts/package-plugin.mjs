#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const targetDir =
  process.env.MINIMAX_PLUGINS_DIR ||
  path.join(os.homedir(), ".minimax/plugins/codex-computer-use");

console.log(`[Package Plugin] Target directory: ${targetDir}`);

fs.mkdirSync(path.join(targetDir, ".minimax-plugin"), { recursive: true });
fs.mkdirSync(path.join(targetDir, "bridge"), { recursive: true });
fs.mkdirSync(path.join(targetDir, "jev"), { recursive: true });
fs.mkdirSync(path.join(targetDir, "skills/codex-computer-use"), { recursive: true });
fs.mkdirSync(path.join(targetDir, "skills/jev-use"), { recursive: true });

function copyFile(relSrc, relDst = relSrc) {
  const src = path.join(REPO_ROOT, relSrc);
  const dst = path.join(targetDir, relDst);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`  ✓ Copied ${relSrc} -> ${relDst}`);
  } else {
    console.warn(`  ! Warning: ${src} not found, skipped.`);
  }
}

function copyDir(relSrc, relDst = relSrc) {
  const src = path.join(REPO_ROOT, relSrc);
  const dst = path.join(targetDir, relDst);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dst, { recursive: true });
    console.log(`  ✓ Copied dir ${relSrc} -> ${relDst}`);
  }
}

copyFile("bridge/server.mjs");
copyFile("bridge/detect-paths.mjs");
copyDir("jev");

if (fs.existsSync(path.join(REPO_ROOT, ".env.local"))) {
  copyFile(".env.local");
}

const pluginJson = {
  schemaVersion: 1,
  name: "codex-computer-use",
  displayName: "Codex Computer Use",
  version: "1.1.0",
  description:
    "Offline native macOS Computer Use runtime via Codex CUA and TypeSafe Jev decision loop.",
  author: "wangdada8208",
  icon: "icon.png",
  darkIcon: "icon-dark.png",
  category: "Productivity",
  exampleQueries: [
    "Open Calculator and calculate 125 * 8",
    "Switch Calendar to previous month",
    "Inspect visible controls in active app",
  ],
  apps: [],
  mcpServers: ["servers.mcp.json"],
  skills: [
    "skills/codex-computer-use/SKILL.md",
    "skills/jev-use/SKILL.md",
  ],
};

fs.writeFileSync(
  path.join(targetDir, ".minimax-plugin/plugin.json"),
  JSON.stringify(pluginJson, null, 2) + "\n"
);
console.log("  ✓ Generated .minimax-plugin/plugin.json");

const serversMcpJson = {
  schemaVersion: 1,
  mcpServers: {
    "codex-computer-use": {
      type: "stdio",
      command: "node",
      args: ["./bridge/server.mjs"],
      description: "Codex CUA MCP stdio server with auto-elicitation and cursor cleanup.",
      timeout: 60000,
    },
  },
};

fs.writeFileSync(
  path.join(targetDir, "servers.mcp.json"),
  JSON.stringify(serversMcpJson, null, 2) + "\n"
);
console.log("  ✓ Generated servers.mcp.json");

copyFile("skill/SKILL.md", "skills/codex-computer-use/SKILL.md");
copyFile("skill/SKILL.md", "skills/jev-use/SKILL.md");

const iconSource = path.join(os.homedir(), ".minimax/plugins/codex-computer-use/icon.png");
const iconDarkSource = path.join(os.homedir(), ".minimax/plugins/codex-computer-use/icon-dark.png");

if (fs.existsSync(iconSource)) {
  fs.copyFileSync(iconSource, path.join(targetDir, "icon.png"));
  fs.copyFileSync(iconDarkSource, path.join(targetDir, "icon-dark.png"));
  console.log("  ✓ Preserved icons in plugin root");
}

console.log("\n[Success] MiniMax Code plugin successfully packaged and deployed to:");
console.log(`  ${targetDir}`);
console.log("\nYou can now open MiniMax Code and type @ in the chat to use it.");
