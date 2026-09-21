#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const HOME = os.homedir();
const BRIDGE_PATH = path.join(REPO_ROOT, "bridge/server.mjs");
const SKILL_MD_PATH = path.join(REPO_ROOT, "skill/SKILL.md");

const args = process.argv.slice(2);
const targetAgent = args.find((a) => !a.startsWith("-")) || "all";

console.log("[codex-cua-jev] Universal Agent Setup Tool");
console.log(`Repository Root: ${REPO_ROOT}`);
console.log(`Bridge Server:   ${BRIDGE_PATH}`);
console.log(`Target:          ${targetAgent}\n`);

function safeReadJson(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch {}
  return defaultValue;
}

function safeWriteJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function installSkillTo(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  const rawSkill = fs.readFileSync(SKILL_MD_PATH, "utf8");
  const processed = rawSkill.replace(/\/path\/to\/codex-cua-jev/g, REPO_ROOT);
  fs.writeFileSync(path.join(targetDir, "SKILL.md"), processed);
}

const configured = [];

// 1. Claude Code
if (targetAgent === "all" || targetAgent === "claude") {
  const claudeConfigDir = path.join(HOME, ".claude");
  const hasClaudeCli = (() => {
    try {
      execSync("command -v claude", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  })();

  if (fs.existsSync(claudeConfigDir) || hasClaudeCli) {
    if (hasClaudeCli) {
      try {
        execSync(`claude mcp add codex-computer-use -- node "${BRIDGE_PATH}"`, {
          stdio: "ignore",
        });
      } catch {}
    }

    const configFile = path.join(claudeConfigDir, "config.json");
    const config = safeReadJson(configFile);
    config.mcpServers = config.mcpServers || {};
    config.mcpServers["codex-computer-use"] = {
      command: "node",
      args: [BRIDGE_PATH],
    };
    safeWriteJson(configFile, config);
    installSkillTo(path.join(claudeConfigDir, "skills/codex-cua-jev"));
    configured.push("Claude Code");
  }
}

// 2. Cursor
if (targetAgent === "all" || targetAgent === "cursor") {
  const cursorConfigDir = path.join(HOME, ".cursor");
  const mcpConfigFile = path.join(cursorConfigDir, "mcp.json");
  const config = safeReadJson(mcpConfigFile);
  config.mcpServers = config.mcpServers || {};
  config.mcpServers["codex-computer-use"] = {
    command: "node",
    args: [BRIDGE_PATH],
  };
  safeWriteJson(mcpConfigFile, config);

  installSkillTo(path.join(cursorConfigDir, "skills/codex-cua-jev"));
  installSkillTo(path.join(HOME, ".agents/skills/codex-cua-jev"));
  configured.push("Cursor");
}

// 3. MiniMax Code / Mavis
if (targetAgent === "all" || targetAgent === "minimax" || targetAgent === "mavis") {
  const minimaxDir = path.join(HOME, ".minimax");
  if (fs.existsSync(minimaxDir) || targetAgent === "minimax" || targetAgent === "mavis") {
    try {
      execSync(`node "${path.join(REPO_ROOT, "scripts/package-plugin.mjs")}"`, {
        stdio: "ignore",
      });
      configured.push("MiniMax Code / Mavis (as native Local Plugin)");
    } catch (err) {
      console.warn(`  ! MiniMax packaging warning: ${err.message}`);
    }
  }
}

// 4. Codex CLI
if (targetAgent === "all" || targetAgent === "codex") {
  const codexDir = path.join(HOME, ".codex");
  if (fs.existsSync(codexDir)) {
    const tomlFile = path.join(codexDir, "config.toml");
    let tomlContent = fs.existsSync(tomlFile) ? fs.readFileSync(tomlFile, "utf8") : "";
    if (!tomlContent.includes("[mcp_servers.codex-computer-use]")) {
      const block = `\n[mcp_servers.codex-computer-use]\ncommand = "node"\nargs = ["${BRIDGE_PATH}"]\n`;
      fs.appendFileSync(tomlFile, block);
    }
    installSkillTo(path.join(codexDir, "skills/codex-cua-jev"));
    configured.push("Codex CLI");
  }
}

// 5. Windsurf
if (targetAgent === "all" || targetAgent === "windsurf") {
  const windsurfConfigFile = path.join(HOME, ".codeium/windsurf/mcp_config.json");
  if (fs.existsSync(path.dirname(windsurfConfigFile))) {
    const config = safeReadJson(windsurfConfigFile);
    config.mcpServers = config.mcpServers || {};
    config.mcpServers["codex-computer-use"] = {
      command: "node",
      args: [BRIDGE_PATH],
    };
    safeWriteJson(windsurfConfigFile, config);
    configured.push("Windsurf");
  }
}

// 6. Roo Code / Cline
if (targetAgent === "all" || targetAgent === "roo" || targetAgent === "cline") {
  const rooPath = path.join(
    HOME,
    "Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json"
  );
  if (fs.existsSync(path.dirname(rooPath))) {
    const config = safeReadJson(rooPath);
    config.mcpServers = config.mcpServers || {};
    config.mcpServers["codex-computer-use"] = {
      command: "node",
      args: [BRIDGE_PATH],
    };
    safeWriteJson(rooPath, config);
    configured.push("Roo Code / Cline");
  }
}

// 7. Zed
if (targetAgent === "all" || targetAgent === "zed") {
  const zedSettingsFile = path.join(HOME, ".config/zed/settings.json");
  if (fs.existsSync(path.dirname(zedSettingsFile))) {
    const config = safeReadJson(zedSettingsFile);
    config.context_servers = config.context_servers || {};
    config.context_servers["codex-computer-use"] = {
      command: {
        path: "node",
        args: [BRIDGE_PATH],
      },
    };
    safeWriteJson(zedSettingsFile, config);
    configured.push("Zed");
  }
}

console.log("--------------------------------------------------");
if (configured.length > 0) {
  console.log("Successfully auto-configured the following agents:");
  configured.forEach((name) => console.log(`  ✓ ${name}`));
} else {
  console.log("No specific agents detected. Configured default global skill directory.");
}
console.log("--------------------------------------------------\n");
