# codex-cua-jev 全市场 AI 智能体一键接入指南

本指南为市面上主流的 AI 编程智能体提供真正的一键式下载与配置方案。

## 终端通用一键安装命令

在 macOS 终端中运行下面这一行命令。脚本会自动检测本机安装的所有智能体并完成全部配置。

```bash
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash
```

该命令会自动克隆仓库到 `~/.codex-cua-jev`，完成 MCP 服务注册、Skill 文件拷贝与 MiniMax 插件打包。

---

## 针对各智能体的一键复制指令

你可以把对应提示词直接复制并发送给你的 Agent。Agent 将全自动完成安装与验证。

### 1. Claude Code

把以下内容直接发送给 Claude Code：

```text
请帮我安装并配置 codex-cua-jev。执行以下命令：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- claude
检查 ~/.codex-cua-jev/.env.local 或环境变量中是否已设置 TYPESAFE_API_KEY。若未设置，请指导我获取并写入。随后调用 codex-computer-use 工具列出当前运行的 macOS 应用以验证可用性。
```

或者在终端手动运行注册命令：

```bash
claude mcp add codex-computer-use -- node "$HOME/.codex-cua-jev/bridge/server.mjs"
```

---

### 2. Cursor

把以下内容直接发送给 Cursor Composer 或 Chat 窗口：

```text
请帮我为 Cursor 配置 codex-cua-jev。执行命令：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- cursor
确保 ~/.cursor/mcp.json 已正确写入指向 ~/.codex-cua-jev/bridge/server.mjs 的配置。
```

或者手动检查 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/你的用户名/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```

---

### 3. MiniMax Code / Mavis

把以下内容直接发送给 MiniMax Code 对话框：

```text
请帮我安装 codex-cua-jev 插件。在终端运行：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- minimax
运行后确认 ~/.minimax/plugins/codex-computer-use 插件已生成，并在会话中测试是否可以通过 @ 呼出 Codex Computer Use。
```

---

### 4. Codex CLI

把以下内容直接发送给 Codex 终端：

```text
请为当前环境安装 codex-cua-jev。执行命令：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- codex
检查 ~/.codex/config.toml 中是否存在 [mcp_servers.codex-computer-use] 配置块。
```

---

### 5. Windsurf

把以下内容直接发送给 Cascade：

```text
请为 Windsurf 配置 codex-cua-jev。执行命令：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- windsurf
确认 ~/.codeium/windsurf/mcp_config.json 中包含 codex-computer-use 条目。
```

---

### 6. Roo Code / Cline (VS Code 插件)

修改 `cline_mcp_settings.json`：

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/你的用户名/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```

---

### 7. OpenCode

修改项目或全局的 `opencode.json`：

```json
{
  "mcp": {
    "codex-computer-use": {
      "type": "local",
      "command": ["node", "/Users/你的用户名/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```

---

### 8. Zed 编辑器

修改 `~/.config/zed/settings.json`：

```json
{
  "context_servers": {
    "codex-computer-use": {
      "command": {
        "path": "node",
        "args": ["/Users/你的用户名/.codex-cua-jev/bridge/server.mjs"]
      }
    }
  }
}
```

---

### 9. ZCode (智谱 Z.ai 桌面 ADE)

把以下内容直接发送给 ZCode 任务窗口：

```text
请为当前 ZCode 环境配置 codex-cua-jev。在终端执行：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- zcode
确认 ~/.zcode/mcp.json 已包含 codex-computer-use 服务配置。
```

或者手动检查 `~/.zcode/mcp.json`：

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/你的用户名/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```

---

### 10. PiCode (Pi Coding Agent)

把以下内容直接发送给 Pi 终端：

```text
请为 Pi 配置 codex-cua-jev。在终端执行：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- pi
确认 ~/.pi/agent/skills/codex-cua-jev/SKILL.md 已正确安装。
```

或者配置 `~/.pi/agent/mcp.json`：

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "command": "node",
      "args": ["/Users/你的用户名/.codex-cua-jev/bridge/server.mjs"]
    }
  }
}
```
