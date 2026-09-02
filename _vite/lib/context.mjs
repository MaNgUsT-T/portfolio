import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const viteDir = fileURLToPath(new URL("..", import.meta.url));
export const repoRoot = resolve(viteDir, "..");

export const cssEntry = resolve(repoRoot, "assets/scss/styles.scss");
export const cssOutput = resolve(repoRoot, "css/styles.min.css");

export const jsBundles = [
  {
    entry: resolve(repoRoot, "assets/js/app.js"),
    outDir: resolve(repoRoot, "js"),
    fileName: "app.min.js",
    globalName: "PortfolioAppBundle"
  },
  {
    entry: resolve(repoRoot, "assets/js/admin.js"),
    outDir: resolve(repoRoot, "js"),
    fileName: "admin.min.js",
    globalName: "PortfolioAdminBundle"
  },
  {
    entry: resolve(repoRoot, "_siteelements/js/siteelements.js"),
    outDir: resolve(repoRoot, "_siteelements/js"),
    fileName: "siteelements.min.js",
    globalName: "PortfolioSiteElementsBundle"
  }
];
