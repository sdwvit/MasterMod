import path from "node:path";
import childProcess from "node:child_process";

import * as fs from "node:fs";
import { logger } from "./logger.mjs";
import { projectRoot, modName, sdkModsFolder } from "./base-paths.mjs";

const cmd = (name: string) => {
  const destinationPath = path.join(sdkModsFolder, name, "Content");
  const sourcePath = path.join(projectRoot, "raw", "Stalker2", "Content");
  logger.log(`Pushing raw mod from ${sourcePath} to ${destinationPath}...`);
  if (fs.readdirSync(sourcePath).length === 0) {
    console.error(`No files found in source path: ${sourcePath}`);
    process.exit(1);
  }
  return ["mkdir", "-p", destinationPath, "&&", "cp", "-r", path.join(sourcePath, "*"), destinationPath].join(" ");
};

childProcess.execSync(cmd(modName), {
  stdio: "inherit",
  cwd: projectRoot,
  shell: "/usr/bin/bash",
});
