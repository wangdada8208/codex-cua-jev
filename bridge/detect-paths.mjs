import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function getResolvedPaths() {
  const home = os.homedir();
  const codexHome = process.env.CODEX_HOME || path.join(home, ".codex");

  const candidates = [
    "/Applications/ChatGPT.app/Contents/Resources/cua_node",
    path.join(home, "Applications/ChatGPT.app/Contents/Resources/cua_node"),
  ];

  let cuaNodeBase = candidates.find((p) => fs.existsSync(p)) || candidates[0];

  const nodeBin = path.join(cuaNodeBase, "bin/node");
  const nodeReplBin = path.join(cuaNodeBase, "bin/node_repl");
  const cuaReplMjs = path.join(cuaNodeBase, "lib/node_modules/@oai/cua-repl/bin/cua-repl.mjs");
  const nodeModulesDir = path.join(cuaNodeBase, "lib/node_modules");

  const skyAppCandidates = [
    path.join(codexHome, "computer-use/Codex Computer Use.app"),
    path.join(home, "Applications/Codex Computer Use.app"),
    "/Applications/Codex Computer Use.app",
  ];

  let skyApp = skyAppCandidates.find((p) => fs.existsSync(p)) || skyAppCandidates[0];

  const skyClientBin = path.join(
    skyApp,
    "Contents/SharedSupport/SkyComputerUseClient.app/Contents/MacOS/SkyComputerUseClient"
  );

  return {
    codexHome,
    cuaNodeBase,
    nodeBin,
    nodeReplBin,
    cuaReplMjs,
    nodeModulesDir,
    skyApp,
    skyClientBin,
  };
}

export function validatePaths(paths = getResolvedPaths()) {
  const missing = [];
  if (!fs.existsSync(paths.nodeBin)) missing.push(`Node binary: ${paths.nodeBin}`);
  if (!fs.existsSync(paths.nodeReplBin)) missing.push(`node_repl: ${paths.nodeReplBin}`);
  if (!fs.existsSync(paths.cuaReplMjs)) missing.push(`cua_repl launcher: ${paths.cuaReplMjs}`);
  if (!fs.existsSync(paths.skyApp)) missing.push(`Codex Computer Use.app: ${paths.skyApp}`);

  return {
    ok: missing.length === 0,
    missing,
    paths,
  };
}
