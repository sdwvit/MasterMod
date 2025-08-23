import path from "node:path";
import childProcess from "node:child_process";

import dotEnv from "dotenv";
import * as fs from "node:fs";
import { logger } from "./logger.mjs";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const MOD_PATH = path.join(import.meta.dirname, "..");
const STAGED_PATH = path.join(process.env.SDK_PATH, "Stalker2", "SavedMods", "Staged");

const cmd = (name: string) => {
  const folderStructure = path.join("Stalker2", "Mods", name, "Content", "Paks", "Windows");
  const sourcePath = path.join(STAGED_PATH, name, "Windows", folderStructure);
  const destinationPath = path.join(MOD_PATH, "steamworkshop", folderStructure);
  logger.log(`Pulling staged mod from ${sourcePath}...`);
  if (fs.readdirSync(sourcePath).length === 0) {
    console.error(`No files found in source path: ${sourcePath}`);
    process.exit(1);
  }
  return ["mkdir", "-p", destinationPath, "&&", "cp", path.join(sourcePath, "*"), destinationPath].join(" ");
};

childProcess.execSync(cmd(process.env.MOD_NAME), {
  stdio: "inherit",
  cwd: MOD_PATH,
  shell: "/usr/bin/bash",
});
