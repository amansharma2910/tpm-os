#!/usr/bin/env node
// npx entry point: runs the bundled install.sh with the caller's arguments,
// working directory, and stdio, and exits with its exit code (0 success,
// 1 usage or verification failure, 2 conflicts not forced).
"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const script = path.join(__dirname, "..", "install.sh");
const result = spawnSync("bash", [script, ...process.argv.slice(2)], { stdio: "inherit" });

if (result.error) {
  const reason = result.error.code === "ENOENT" ? "bash was not found on PATH" : result.error.message;
  console.error(`tpm-os: ${reason}. The installer needs bash (macOS, Linux, WSL, or Git Bash).`);
  process.exit(1);
}
process.exit(result.status === null ? 1 : result.status);
