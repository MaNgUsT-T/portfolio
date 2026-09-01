import { build } from "vite";
import { jsBundles, jsOutputDir, repoRoot } from "../context.mjs";
import { npmCmd, run } from "../utils/process.mjs";

async function buildBundle(bundle, watch = false) {
  return build({
    configFile: false,
    root: repoRoot,
    publicDir: false,
    build: {
      outDir: jsOutputDir,
      emptyOutDir: false,
      sourcemap: true,
      minify: "esbuild",
      target: "es2018",
      watch: watch ? {} : undefined,
      rollupOptions: {
        input: bundle.entry,
        output: {
          format: "iife",
          name: bundle.globalName,
          entryFileNames: bundle.fileName,
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: "[name]-[hash][extname]"
        }
      }
    }
  });
}

export async function taskProdJs() {
  for (const bundle of jsBundles) {
    await buildBundle(bundle);
  }
}

export function taskDevJs() {
  run(npmCmd, [
    "--prefix",
    "_vite",
        "exec",
        "--",
        "chokidar",
        "assets/js/**/*.js",
        "_siteelements/js/**/*.js",
        "-c",
        `${process.execPath} _vite/vite.mjs prod:js`,
        "-d",
    "200"
  ]);
}
