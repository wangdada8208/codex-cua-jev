# codex-cua-jev

Bridge OpenAI Codex's official native macOS Computer Use runtime to any AI agent without requiring an OpenAI account. Combine it with TypeSafe's Jev model for precise accessibility-tree decisions.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: macOS](https://img.shields.io/badge/Platform-macOS-lightgrey.svg)](https://apple.com/macos)

[中文说明 (README_zh.md)](README_zh.md) | [Universal Agent Guide](docs/universal-agent-guide.md)

## Why This Exists

Most desktop Computer Use agents stream full-screen screenshots to vision models. This approach consumes millions of tokens and frequently hallucinates pixel coordinates.

OpenAI Codex includes a high-performance local runtime (`cua_node` and `Codex Computer Use.app`). This runtime operates directly on macOS Accessibility (AX) trees and native events. It works completely offline on your Mac without login.

However, standard MCP clients cannot use it directly. The runtime triggers an internal confirmation protocol (`elicitation/create`) that causes third-party clients to hang. Additionally, interrupting a session leaves an orphaned visual cursor overlay on screen.

`codex-cua-jev` solves both problems:
1. **Transparent Protocol Bridge**: Automatically handles internal permission handshakes and registers cleanup hooks to prevent stuck cursor overlays.
2. **TypeSafe Jev Decision Engine**: Replaces coordinate guessing with calibrated element selection directly on the AX tree.
3. **Universal Agent Skill & Plugin**: Compatible with Claude Code, Cursor, MiniMax Code, ZCode, PiCode, Codex, Windsurf, OpenCode, Roo Code, and Zed.

## Architecture

```
[ AI Agent ] (Claude Code / Cursor / MiniMax / ZCode / PiCode / OpenCode)
     │
     ▼ (Standard MCP stdio)
[ bridge/server.mjs ]
     │  ├── Auto-accepts elicitation prompts
     │  └── Cleans up cursor overlay on shutdown
     ▼
[ Codex CUA Runtime ] (cua_node / SkyComputerUseService)
     │
     ├── Reads macOS Accessibility Tree
     └── Dispatches native clicks and keyboard events
            ▲
            │ Selects actionable element & evaluates risk
[ TypeSafe Jev System One ] (api.typesafe.ai)
```

## Prerequisites

- macOS 14 Sonoma or newer.
- Desktop ChatGPT.app installed in `/Applications/ChatGPT.app`.
- Node.js 20 or newer.
- Accessibility permission granted in `System Settings > Privacy & Security > Accessibility`.
- TypeSafe API key from [console.typesafe.ai](https://console.typesafe.ai/keys) (set as `TYPESAFE_API_KEY`).

---

## Universal One-Line Terminal Installer

Run this single command in your macOS terminal to configure all installed agents on your machine at once:

```bash
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash
```

The script automatically detects installed agents, clones the repository to `~/.codex-cua-jev`, registers MCP servers, installs skills, and builds the MiniMax plugin.

---

## Supported Agents & Direct Setup

### 1. Claude Code
Run the registration command:
```bash
claude mcp add codex-computer-use -- node "$HOME/.codex-cua-jev/bridge/server.mjs"
```
Or paste this prompt directly into Claude Code:
```text
Please install codex-cua-jev for me:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- claude
Then check if TYPESAFE_API_KEY is present in ~/.codex-cua-jev/.env.local and verify by listing running macOS apps via the codex-computer-use tool.
```

### 2. Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/USER/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```
Or paste this prompt into Cursor Composer:
```text
Please configure codex-cua-jev for Cursor:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- cursor
```

### 3. MiniMax Code / Mavis (Native Plugin)
Package and deploy as a native local plugin:
```bash
npm run package-plugin
```
Once installed, typing `@` in MiniMax Code reveals `Codex Computer Use` and `@jev-use`.
Prompt for MiniMax Code:
```text
请帮我安装 codex-cua-jev 插件：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- minimax
```

### 4. ZCode (Z.ai / 智谱 ADE)
Configure in `~/.zcode/mcp.json`:
```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/USER/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```
Prompt for ZCode:
```text
Please configure codex-cua-jev for ZCode:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- zcode
```

### 5. PiCode (Pi Coding Agent)
Configure in `~/.pi/agent/mcp.json` and install skill to `~/.pi/agent/skills/codex-cua-jev`:
```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/USER/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```
Prompt for Pi:
```text
Please set up codex-cua-jev for Pi:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- pi
```

### 6. Codex CLI
Append to `~/.codex/config.toml`:
```toml
[mcp_servers.codex-computer-use]
command = "node"
args = ["/Users/USER/.codex-cua-jev/bridge/server.mjs"]
```

### 7. Windsurf (Codeium)
Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/USER/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```

### 8. Roo Code / Cline (VS Code)
Add to `cline_mcp_settings.json`:
```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/USER/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```

### 9. OpenCode
Add to `opencode.json`:
```json
{
  "mcp": {
    "codex-computer-use": {
      "type": "local",
      "command": ["node", "/Users/USER/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```

### 10. Zed Editor
Add to `~/.config/zed/settings.json`:
```json
{
  "context_servers": {
    "codex-computer-use": {
      "command": {
        "path": "node",
        "args": ["/Users/USER/.codex-cua-jev/bridge/server.mjs"]
      }
    }
  }
}
```

---

## Usage in Agent Scripts

Run the autonomous loop inside CUA's JavaScript execution environment:

```javascript
import { pathToFileURL } from "node:url";

const repoDir = "/path/to/codex-cua-jev";
const jevLoop = await import(pathToFileURL(`${repoDir}/jev/loop.mjs`).href);

const result = await jevLoop.runTask({
  driver: jevLoop.createCuaDriver(cua),
  appName: "Calculator",
  goal: "calculate 125 * 8",
  dryRun: false,
  maxSteps: 5,
});

nodeRepl.write(result);
```

## Safety and Guardrails

The policy gate (`jev/policy.mjs`) stops for confirmation whenever:
- An operation targets deletion, payment, authentication, or sharing.
- Jev risk score is elevated (`risk >= 0.2`).
- The target application is outside the allowed list.

## License

MIT License. See [LICENSE](LICENSE) for details.
