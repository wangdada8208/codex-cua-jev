#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const home = os.homedir();
const targets = [
  path.join(home, ".claude/skills/codex-cua-jev"),
  path.join(home, ".codex/skills/codex-cua-jev"),
  path.join(home, ".agents/skills/codex-cua-jev"),
];

console.log("[Install Skill] Installing skill across agent directories...");

for (const target of targets) {
  const parent = path.dirname(target);
  if (fs.existsSync(parent)) {
    fs.mkdirSync(target, { recursive: true });
    const skillContent = fs.readFileSync(path.join(REPO_ROOT, "skill/SKILL.md"), "utf8");
    const replaced = skillContent.replace(/\/path\/to\/codex-cua-jev/g, REPO_ROOT);
    fs.writeFileSync(path.join(target, "SKILL.md"), replaced);
    console.log(`  ✓ Installed to ${target}/SKILL.md`);
  }
}

console.log("\n[Success] Skill installation completed.");
