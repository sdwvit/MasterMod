import path from "node:path";
import childProcess from "node:child_process";
import { modName } from "./base-paths.mjs";
import { logger } from "./logger.mjs";
import { cookMod, getStagedPath } from "./cook.ts";
import { spawnSync } from "child_process";

cookMod(modName);

logger.log("Injecting into the game using command: ");

const fullCmd = [
  "cp",
  path.join(getStagedPath(modName), "*"),
  `'${process.env.STALKER2_MODS_FOLDER}'`,
  "&&",
  "open",
  `'${process.env.STALKER2_MODS_FOLDER}'`,
].join(" ");

logger.log(fullCmd + "\n\nExecuting...\n");

const root = path.join(import.meta.dirname, "..");

childProcess.execSync(fullCmd, {
  stdio: "inherit",
  cwd: root,
  shell: "/usr/bin/bash",
});

spawnSync("paplay", ["./pop.wav"]);
