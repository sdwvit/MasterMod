import path from "node:path";
import childProcess from "node:child_process";

import dotEnv from "dotenv";
import * as fs from "node:fs";
import { logger } from "./logger.mjs";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const MOD_PATH = path.join(import.meta.dirname, "..");
const SDK_PATH = process.env.SDK_PATH;
const SDK_MODS_PATH = path.join(SDK_PATH, "Stalker2", "Mods");

const cmd = (name: string) => {
  const destinationPath = path.join(SDK_MODS_PATH, name, "Content");
  const sourcePath = path.join(MOD_PATH, "raw", "Stalker2", "Content");
  logger.log(`Pushing raw mod from ${sourcePath} to ${destinationPath}...`);
  if (fs.readdirSync(sourcePath).length === 0) {
    console.error(`No files found in source path: ${sourcePath}`);
    process.exit(1);
  }
  return ["mkdir", "-p", destinationPath, "&&", "cp", "-r", path.join(sourcePath, "*"), destinationPath].join(" ");
};

childProcess.execSync(cmd(process.env.MOD_NAME), {
  stdio: "inherit",
  cwd: MOD_PATH,
  shell: "/usr/bin/bash",
});
