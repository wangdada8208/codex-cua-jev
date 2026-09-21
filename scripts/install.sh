#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo "  codex-cua-jev Universal Agent Installer"
echo "=================================================="

# 1. OS verification
if [[ "$(uname)" != "Darwin" ]]; then
  echo "Error: codex-cua-jev requires macOS because it bridges official macOS Computer Use." >&2
  exit 1
fi

# 2. Node.js check
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but not installed. Please install Node.js 20 or newer." >&2
  exit 1
fi

NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
if (( NODE_MAJOR < 20 )); then
  echo "Error: Node.js version 20 or newer is required. Found: $(node -v)" >&2
  exit 1
fi

# 3. macOS ChatGPT.app check
if [[ ! -d "/Applications/ChatGPT.app" && ! -d "$HOME/Applications/ChatGPT.app" ]]; then
  echo "Warning: Official ChatGPT.app not found in /Applications or ~/Applications."
  echo "Please make sure official desktop ChatGPT is installed to provide the CUA runtime."
fi

# 4. Resolve destination
INSTALL_DIR="${CODEX_CUA_JEV_DIR:-$HOME/.codex-cua-jev}"

if [[ -d "$INSTALL_DIR/.git" ]]; then
  echo "Updating existing installation at $INSTALL_DIR..."
  git -C "$INSTALL_DIR" pull --ff-only || true
else
  echo "Cloning codex-cua-jev into $INSTALL_DIR..."
  rm -rf "$INSTALL_DIR"
  git clone https://github.com/wangdada8208/codex-cua-jev.git "$INSTALL_DIR"
fi

# 5. Run setup
echo "Running automatic agent configuration..."
node "$INSTALL_DIR/scripts/setup-agents.mjs" "${1:-all}"

echo "=================================================="
echo "  Installation Complete!"
echo "=================================================="
echo "Location: $INSTALL_DIR"
echo "Next step: Set your TYPESAFE_API_KEY in $INSTALL_DIR/.env.local or export TYPESAFE_API_KEY=your_key"
echo ""
