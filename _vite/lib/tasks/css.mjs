import { cssEntry, cssOutput } from "../context.mjs";
import { npmCmd, run } from "../utils/process.mjs";

export function taskDevCss() {
  run(npmCmd, [
    "--prefix",
    "_vite",
    "exec",
    "--",
    "sass",
    "--watch",
    "--style=compressed",
    "--source-map",
    cssEntry,
    cssOutput
  ]);
}

export function taskProdCss() {
  run(npmCmd, [
    "--prefix",
    "_vite",
    "exec",
    "--",
    "sass",
    "--style=compressed",
    "--source-map",
    cssEntry,
    cssOutput
  ]);
}
