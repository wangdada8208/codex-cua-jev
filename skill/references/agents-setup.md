# Connecting Codex CUA + Jev to AI Agents

This guide details how to register `codex-cua-jev` as an MCP server across various AI coding agents.

## Prerequisites

1. **macOS** with official desktop ChatGPT.app installed (provides `cua_node` runtime).
2. **Node.js 20+**.
3. **TypeSafe API Key** from [console.typesafe.ai](https://console.typesafe.ai/keys) (set as `TYPESAFE_API_KEY` or in `.env.local`).
4. Accessibility permissions granted to Terminal / your AI Agent in macOS `System Settings > Privacy & Security > Accessibility`.

---

## 1. Claude Code

Register via Claude's CLI:

```bash
claude mcp add codex-computer-use -- node /absolute/path/to/codex-cua-jev/bridge/server.mjs
```

Or add to `~/.claude/config.json`:

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/absolute/path/to/codex-cua-jev/bridge/server.mjs"],
      "env": {
        "TYPESAFE_API_KEY": "your_typesafe_key"
      }
    }
  }
}
```

---

## 2. Cursor / Windsurf / Cline / Generic MCP Clients

Add to your workspace or global MCP configuration (`mcpServers` object):

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/absolute/path/to/codex-cua-jev/bridge/server.mjs"],
      "env": {
        "TYPESAFE_API_KEY": "your_typesafe_key"
      }
    }
  }
}
```

---

## 3. OpenCode

Add to `opencode.json`:

```json
{
  "mcp": {
    "codex-computer-use": {
      "type": "local",
      "command": ["node", "/absolute/path/to/codex-cua-jev/bridge/server.mjs"],
      "environment": {
        "TYPESAFE_API_KEY": "your_typesafe_key"
      }
    }
  }
}
```

---

## 4. Codex CLI (`~/.codex/config.toml`)

```toml
[mcp_servers.codex-computer-use]
command = "node"
args = ["/absolute/path/to/codex-cua-jev/bridge/server.mjs"]
```
