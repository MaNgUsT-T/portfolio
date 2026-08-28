import { spawnSync } from "node:child_process";
import { repoRoot } from "../context.mjs";

export const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

export function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });

  if (result.error) {
    console.error(`Command failed: ${cmd} ${args.join(" ")}`);
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
