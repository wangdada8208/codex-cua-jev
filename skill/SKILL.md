---
name: codex-cua-jev
description: |
  Operate native macOS desktop applications using Codex Computer Use runtime without OpenAI login, guided by TypeSafe's Jev model for precise accessibility-tree decision making and zero-coordinate guessing. Use when the user requests macOS GUI automation, interacting with desktop apps (Calendar, Calculator, Notes, Chrome, etc.), or asks for Computer Use via Jev.
---

# Codex CUA + Jev Desktop Automation Skill

This skill allows any AI agent to control native macOS applications by combining two complementary engines:
1. **Codex CUA Engine**: The local headless Computer Use runtime from macOS ChatGPT.app, providing full Accessibility (AX) tree inspection, element focus, native typing, and key dispatch without requiring an OpenAI account.
2. **TypeSafe Jev Model**: A calibrated decision model that scores and selects actionable elements from structured AX text, determines goal completion probability, and enforces safety boundaries without streaming expensive full-screen images.

## Architecture

```
[ Your AI Agent ] (Claude Code / OpenCode / Cursor / MiniMax / Mavis)
       │
       ▼ (MCP stdio protocol)
[ bridge/server.mjs ]
       │  ├── Auto-accepts local authorization prompts (elicitation/create)
       │  └── Registers cleanup hooks (turn-ended) to prevent stuck cursor overlays
       ▼
[ Codex CUA Runtime ] (cua_repl / SkyComputerUseService)
       │
       ├── Reads macOS Accessibility Tree (AX)
       └── Executes native clicks, text inputs, and key events
              ▲
              │ Next action & target selection
[ TypeSafe Jev System One ] (api.typesafe.ai)
```

## Running Tasks

### Workflow A: Autonomous Jev Loop (Recommended)

When given a multi-step objective, execute the Jev loop inside the CUA JavaScript execution environment:

```javascript
import { pathToFileURL } from "node:url";

const repoDir = "/path/to/codex-cua-jev";
const jevLoop = await import(pathToFileURL(`${repoDir}/jev/loop.mjs`).href);

const result = await jevLoop.runTask({
  driver: jevLoop.createCuaDriver(cua),
  appName: "Calendar",
  goal: "switch the calendar to the previous month",
  dryRun: false,
  maxSteps: 5,
});

nodeRepl.write(result);
```

### Workflow B: Direct Control (Single Actions)

For simple direct actions, use the native `cua` bindings:

```javascript
// 1. Get running app and its initial AX tree
let app = await cua.getApp("Calculator");

// 2. Perform actions by element index
await app.click(9);          // Click 7
await app.click(20);         // Click +
await app.click(10);         // Click 8
await app.click(24);         // Click =

// 3. Re-read updated state
let ax = await app.getAXState();
nodeRepl.write(ax);
```

## Safety Gate & Sensitive Actions

The policy engine (`jev/policy.mjs`) automatically halts and flags actions as `confirm` if:
- Target matches deletion, payment, authentication, sharing, or settings modification.
- Jev risk score is elevated (`risk >= 0.2`).
- The application is not in the trusted allowlist (`DEFAULT_ALLOWED_APPS`).

## Bundled References
- `references/agents-setup.md`: Setup instructions for Claude Code, Codex, OpenCode, Cursor, and Windsurf.
- `references/plugin-guide.md`: Complete guide for packaging as a MiniMax Code / Mavis plugin.
