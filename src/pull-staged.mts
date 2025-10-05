import path from "node:path";
import childProcess from "node:child_process";

import * as fs from "node:fs";
import { logger } from "./logger.mjs";
import { projectRoot, modName, sdkStagedFolder } from "./base-paths.mjs";

const cmd = () => {
  const folderStructure = path.join("Stalker2", "Mods", modName, "Content", "Paks", "Windows");
  const sourcePath = path.join(sdkStagedFolder, modName, "Windows", folderStructure);
  const destinationPath = path.join(projectRoot, "steamworkshop", folderStructure);
  logger.log(`Pulling staged mod from ${sourcePath}...`);
  if (fs.readdirSync(sourcePath).length === 0) {
    console.error(`No files found in source path: ${sourcePath}`);
    process.exit(1);
  }
  return ["mkdir", "-p", destinationPath, "&&", "cp", path.join(sourcePath, "*"), destinationPath].join(" ");
};

childProcess.execSync(cmd(), {
  stdio: "inherit",
  cwd: projectRoot,
  shell: "/usr/bin/bash",
});
