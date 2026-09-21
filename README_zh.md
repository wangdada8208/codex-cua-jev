# codex-cua-jev

将 OpenAI Codex 官方原生的 macOS Computer Use 运行时无缝接入任意 AI 智能体，无需登录 OpenAI 账号。结合 TypeSafe Jev 模型实现精准的无障碍树决策与低成本桌面自动化。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: macOS](https://img.shields.io/badge/Platform-macOS-lightgrey.svg)](https://apple.com/macos)

[English README](README.md) | [全智能体接入指南 (docs/universal-agent-guide_zh.md)](docs/universal-agent-guide_zh.md)

## 为什么需要本项目

传统的电脑控制智能体通常依赖全屏截图并传入多模态大模型。这种方式每步消耗数万甚至数十万 Token，且极易出现像素坐标定位偏差。

macOS 版官方 ChatGPT / Codex 随附了高效的原生桌面操作引擎（`cua_node` 与 `Codex Computer Use.app`）。它直接在系统辅助功能无障碍树（Accessibility Tree）上运作。该引擎完全离线运行在本地 macOS 系统上，无需任何 OpenAI 账号登录。

第三方客户端直接作为 MCP 服务接入时会遇到两个关键阻碍：
1. 官方引擎内置了独有的二次安全确认协议（`elicitation/create`），导致普通客户端挂起或报错。
2. 任务意外中断或退出时，屏幕上容易残留虚拟蓝色光标遮罩。

本项目针对上述问题提供了完整的解决方案：
1. **透明协议桥接器**：自动处理本地授权握手，并在进程退出时自动注销屏幕悬浮遮罩。
2. **Jev 智能决策循环**：通过 TypeSafe Jev 模型直接从控件树中选择目标与动作，省去像素坐标猜测。
3. **通用智能体接入与插件封装**：原生支持 Claude Code、Cursor、MiniMax Code、ZCode、PiCode、Codex CLI、Windsurf、OpenCode、Roo Code 与 Zed。

## 系统架构

```
[ AI 智能体 ] (Claude Code / Cursor / MiniMax / ZCode / PiCode / OpenCode)
      │
      ▼ (标准 MCP stdio 协议)
[ bridge/server.mjs ]
      │  ├── 自动应答底层权限请求 (elicitation/create)
      │  └── 进程中断与退出时自动注销悬浮光标
      ▼
[ Codex CUA 原生运行时 ] (cua_node / SkyComputerUseService)
      │
      ├── 读取 macOS Accessibility 控件树
      └── 派发系统级原生点击、输入与按键
             ▲
             │ 选择下一步动作与目标控件
[ TypeSafe Jev System One ] (api.typesafe.ai)
```

## 前置要求

- macOS 14 Sonoma 或更新版本。
- 本地安装了官方桌面版 ChatGPT.app（路径为 `/Applications/ChatGPT.app`）。
- Node.js 20 或更高版本。
- 在系统设置中为终端或对应的 Agent 授予辅助功能权限。
- 在 [console.typesafe.ai](https://console.typesafe.ai/keys) 获取 TypeSafe API Key。

---

## 终端通用一键安装（推荐）

在 macOS 终端中运行下面这行命令，脚本会自动检测本机安装的所有智能体并一次性完成全部配置：

```bash
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash
```

该命令会自动克隆仓库到 `~/.codex-cua-jev`，完成 MCP 服务注册、Skill 文件拷贝与 MiniMax 插件打包。

---

## 主流智能体独立配置与一键提示词

### 1. Claude Code
直接运行注册命令：
```bash
claude mcp add codex-computer-use -- node "$HOME/.codex-cua-jev/bridge/server.mjs"
```
或将此提示词直接发给 Claude Code：
```text
请帮我安装并配置 codex-cua-jev：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- claude
检查 ~/.codex-cua-jev/.env.local 是否有 TYPESAFE_API_KEY，随后调用 codex-computer-use 工具列出正在运行的应用以验证可用性。
```

### 2. Cursor
在 `~/.cursor/mcp.json` 中配置：
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
或将此提示词发给 Cursor Composer：
```text
请为 Cursor 配置 codex-cua-jev：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- cursor
```

### 3. MiniMax Code / Mavis (本地插件)
一键打包并部署为原生插件：
```bash
npm run package-plugin
```
安装后在 MiniMax Code 输入 `@` 即可直接看到 `Codex Computer Use` 和 `@jev-use`。
提示词：
```text
请帮我安装 codex-cua-jev 插件：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- minimax
```

### 4. ZCode (智谱 Z.ai 桌面 ADE)
在 `~/.zcode/mcp.json` 中配置：
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
或发给 ZCode 任务窗口：
```text
请为当前 ZCode 环境配置 codex-cua-jev：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- zcode
```

### 5. PiCode (Pi Coding Agent)
配置 `~/.pi/agent/mcp.json` 并安装技能到 `~/.pi/agent/skills/codex-cua-jev`：
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
或发给 Pi 终端：
```text
请为 Pi 配置 codex-cua-jev：
curl -fsSL https://raw.githubusercontent.com/wangdada8208/codex-cua-jev/main/scripts/install.sh | bash -s -- pi
```

### 6. Codex CLI
在 `~/.codex/config.toml` 中追加：
```toml
[mcp_servers.codex-computer-use]
command = "node"
args = ["/Users/你的用户名/.codex-cua-jev/bridge/server.mjs"]
```

### 7. Windsurf (Codeium)
在 `~/.codeium/windsurf/mcp_config.json` 中配置：
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

### 8. Roo Code / Cline (VS Code)
在 `cline_mcp_settings.json` 中配置：
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

### 9. OpenCode
在 `opencode.json` 中配置：
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

### 10. Zed 编辑器
在 `~/.config/zed/settings.json` 中配置：
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

## 智能体脚本调用示例

在 CUA 的 JavaScript 运行时中执行自动化循环：

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

## 安全守卫策略

安全引擎（`jev/policy.mjs`）会在下列情况下自动暂停并等待确认：
- 目标包含删除、转账支付、授权或分享等敏感行为。
- Jev 评估的风险概率超过阈值（`risk >= 0.2`）。
- 目标应用不在受信任的白名单中。

## 开源协议

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。
