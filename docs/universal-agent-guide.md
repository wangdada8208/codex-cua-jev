# Universal Agent Installation Guide for codex-cua-jev

This guide provides automated installation methods for every major AI coding agent.

## Universal One-Line Terminal Command

Run this single command in your macOS terminal. It automatically detects all installed agents and configures them.

```bash
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash
```

The script clones the repository into `~/.codex-cua-jev`, configures MCP servers, registers skills, and builds plugins.

---

## One-Click Agent Prompts

You can also paste the exact prompt block below into any AI agent. The agent will run the installation autonomously.

### 1. Claude Code

Paste this prompt directly into Claude Code:

```text
Please install codex-cua-jev for me. Run this command:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- claude
Then check if TYPESAFE_API_KEY is present in ~/.codex-cua-jev/.env.local or the environment. Guide me to set it if missing. Verify by listing running macOS apps via the codex-computer-use MCP tool.
```

Or run the manual CLI command:

```bash
claude mcp add codex-computer-use -- node "$HOME/.codex-cua-jev/bridge/server.mjs"
```

---

### 2. Cursor

Paste this prompt directly into Cursor Composer or Chat:

```text
Please set up codex-cua-jev for Cursor. Run:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- cursor
Ensure ~/.cursor/mcp.json contains the codex-computer-use entry pointing to ~/.codex-cua-jev/bridge/server.mjs.
```

Or verify your `~/.cursor/mcp.json` file:

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

---

### 3. MiniMax Code / Mavis

Paste this prompt directly into MiniMax Code:

```text
请帮我安装 codex-cua-jev 插件。在终端运行：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- minimax
运行后确认 ~/.minimax/plugins/codex-computer-use 插件包已生成，并在会话中测试是否可以通过 @ 呼出 Codex Computer Use。
```

Or run the packaging command directly in the repository:

```bash
node ~/.codex-cua-jev/scripts/package-plugin.mjs
```

---

### 4. Codex CLI

Paste this prompt directly into Codex:

```text
Install codex-cua-jev MCP server into ~/.codex/config.toml. Run:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- codex
Confirm [mcp_servers.codex-computer-use] is present in ~/.codex/config.toml.
```

---

### 5. Windsurf

Paste this prompt directly into Cascade:

```text
Please set up codex-cua-jev for Windsurf. Run:
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- windsurf
Confirm ~/.codeium/windsurf/mcp_config.json contains codex-computer-use.
```

---

### 6. Roo Code / Cline (VS Code Extension)

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

---

### 7. OpenCode

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

---

### 8. Zed Editor

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
