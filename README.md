# codex-cua-jev

Bridge OpenAI Codex's official native macOS Computer Use runtime to any AI agent without requiring an OpenAI account. Combine it with TypeSafe's Jev model for precise accessibility-tree decisions.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: macOS](https://img.shields.io/badge/Platform-macOS-lightgrey.svg)](https://apple.com/macos)

## Why This Exists

Most desktop Computer Use agents stream full-screen screenshots to vision models. This approach consumes millions of tokens and frequently hallucinates pixel coordinates.

OpenAI Codex includes a high-performance local runtime (`cua_node` and `Codex Computer Use.app`). This runtime operates directly on macOS Accessibility (AX) trees and native events. It works completely offline on your Mac without login.

However, standard MCP clients cannot use it directly. The runtime triggers an internal confirmation protocol (`elicitation/create`) that causes third-party clients to hang. Additionally, interrupting a session leaves an orphaned visual cursor overlay on screen.

`codex-cua-jev` solves both problems:
1. **Transparent Protocol Bridge**: Automatically handles internal permission handshakes and registers cleanup hooks to prevent stuck cursor overlays.
2. **TypeSafe Jev Decision Engine**: Replaces coordinate guessing with calibrated element selection directly on the AX tree.
3. **Universal Agent Skill & Plugin**: Compatible with Claude Code, Cursor, OpenCode, Codex, and MiniMax Code.

## Architecture

```
[ AI Agent ] (Claude Code / Cursor / OpenCode / MiniMax)
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

## Quick Start

### Universal One-Line Installer

Run this single command in your macOS terminal to configure all installed agents at once:

```bash
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash
```

See [docs/universal-agent-guide.md](docs/universal-agent-guide.md) for full instructions and one-click prompts for Claude Code, Cursor, MiniMax Code, Codex, Windsurf, OpenCode, Roo Code, and Zed.

### Manual Setup and Test

```bash
git clone https://github.com/wangdada8208/codex-cua-jev.git
cd codex-cua-jev
echo 'TYPESAFE_API_KEY=your_key_here' > .env.local
npm test
```

### 2. Connect to Your Agent

#### Claude Code

```bash
claude mcp add codex-computer-use -- node $(pwd)/bridge/server.mjs
```

#### Cursor, Windsurf, or Cline

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/absolute/path/to/codex-cua-jev/bridge/server.mjs"],
      "env": {
        "TYPESAFE_API_KEY": "your_key_here"
      }
    }
  }
}
```

#### MiniMax Code / Mavis (Packaging as a Plugin)

To package and deploy this repository as a native MiniMax Code plugin:

```bash
npm run package-plugin
```

Once installed, type `@` in your chat window. You will see `Codex Computer Use` and `@jev-use` ready to invoke. See [skill/references/plugin-guide.md](skill/references/plugin-guide.md) for full packaging specifications.

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
