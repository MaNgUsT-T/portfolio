import {
  taskDevCss,
  taskProdCss
} from "./lib/tasks/css.mjs";
import { taskDevJs, taskProdJs } from "./lib/tasks/js.mjs";
import { npmCmd, run } from "./lib/utils/process.mjs";

const helpText =
  "Use one of: dev, dev:css, dev:js, prod, prod:css, prod:js";

const task = process.argv[2] ?? "dev";

if (task === "--help" || task === "-h" || task === "help") {
  console.log(helpText);
  process.exit(0);
}

try {
  switch (task) {
    case "dev":
      taskProdCss();
      await taskProdJs();
      run(npmCmd, [
        "--prefix",
        "_vite",
        "exec",
        "--",
        "chokidar",
        "assets/scss/**/*.scss",
        "assets/js/**/*.js",
        "_siteelements/js/siteelements.js",
        "_siteelements/js/siteelements/**/*.js",
        "-c",
        `${process.execPath} _vite/vite.mjs prod:css && ${process.execPath} _vite/vite.mjs prod:js`,
        "-d",
        "200"
      ]);
      break;
    case "dev:css":
      taskDevCss();
      break;
    case "dev:js":
      taskDevJs();
      break;
    case "prod":
      taskProdCss();
      await taskProdJs();
      break;
    case "prod:css":
      taskProdCss();
      break;
    case "prod:js":
      await taskProdJs();
      break;
    default:
      console.error(`Unknown task '${task}'. ${helpText}`);
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
