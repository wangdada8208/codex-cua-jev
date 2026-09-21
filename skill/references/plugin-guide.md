# Packaging as a MiniMax Code / Mavis Plugin

This document explains how to package `codex-cua-jev` into a local plugin for MiniMax Code and Mavis Desktop, allowing users to invoke it directly by typing `@` in the chat interface.

---

## 1. What is a Local MiniMax Plugin?

MiniMax Code scans `~/.minimax/plugins/` on startup and in real time. Any subdirectory containing a valid `.minimax-plugin/plugin.json` is automatically loaded as a native Local Plugin.

When loaded:
- The plugin appears in the plugins manager.
- Typing `@` in the chat input displays the plugin and its declared skills.
- Declared MCP servers start on demand when the skill or tools are invoked.

---

## 2. Plugin Directory Structure

A complete plugin package has this structure:

```text
~/.minimax/plugins/codex-computer-use/
├── .minimax-plugin/
│   └── plugin.json           # Main plugin manifest
├── servers.mcp.json          # MCP server configuration
├── icon.png                  # Light mode icon (PNG)
├── icon-dark.png             # Dark mode icon (PNG)
├── bridge/
│   ├── server.mjs            # Codex CUA MCP bridge script
│   └── detect-paths.mjs      # Path detector
├── jev/                      # Jev decision loop modules
│   ├── decide.mjs
│   ├── loop.mjs
│   └── policy.mjs
└── skills/
    ├── codex-computer-use/
    │   └── SKILL.md          # Primary skill definition
    └── jev-use/
        └── SKILL.md          # Autonomous Jev loop skill
```

---

## 3. Manifest Specification

### `.minimax-plugin/plugin.json`

```json
{
  "schemaVersion": 1,
  "name": "codex-computer-use",
  "displayName": "Codex Computer Use",
  "version": "1.0.0",
  "description": "Offline native macOS Computer Use runtime via Codex CUA and TypeSafe Jev decision loop.",
  "author": "wangdada8208",
  "icon": "icon.png",
  "darkIcon": "icon-dark.png",
  "category": "Productivity",
  "exampleQueries": [
    "Open Calculator and calculate 125 * 8",
    "Switch Calendar to previous month",
    "Inspect visible controls in active app"
  ],
  "apps": [],
  "mcpServers": [
    "servers.mcp.json"
  ],
  "skills": [
    "skills/codex-computer-use/SKILL.md",
    "skills/jev-use/SKILL.md"
  ]
}
```

### `servers.mcp.json`

```json
{
  "schemaVersion": 1,
  "mcpServers": {
    "codex-computer-use": {
      "type": "stdio",
      "command": "node",
      "args": ["./bridge/server.mjs"],
      "description": "Codex CUA MCP stdio server with auto-elicitation and cursor cleanup.",
      "timeout": 60000
    }
  }
}
```

---

## 4. Automated One-Click Installation

To build and install the plugin directly into your local MiniMax Code environment, run:

```bash
npm run package-plugin
```

This script copies all required files, links the bridge, validates the package integrity, and outputs the installation status. MiniMax Code detects the new plugin automatically within seconds.

---

## 5. Verifying the Plugin

1. Open MiniMax Code.
2. In any chat window, type `@`.
3. In the popup list, you will see `Codex Computer Use` and `@jev-use`.
4. Select it and type your task, such as:
   `@Codex Computer Use open Calculator and press 123`
