import test from "node:test";
import assert from "node:assert/strict";
import { getResolvedPaths, validatePaths } from "../bridge/detect-paths.mjs";

test("getResolvedPaths returns complete path dictionary", () => {
  const paths = getResolvedPaths();
  assert.ok(paths.nodeBin, "nodeBin must be defined");
  assert.ok(paths.nodeReplBin, "nodeReplBin must be defined");
  assert.ok(paths.cuaReplMjs, "cuaReplMjs must be defined");
  assert.ok(paths.skyApp, "skyApp must be defined");
});

test("validatePaths returns diagnostic structure", () => {
  const validation = validatePaths();
  assert.equal(typeof validation.ok, "boolean");
  assert.ok(Array.isArray(validation.missing));
  assert.ok(validation.paths);
});
