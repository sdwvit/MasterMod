import path from "node:path";

import * as fs from "node:fs";
import { logger } from "./logger.mjs";
import { modName, sdkModsFolder, modFolderRaw } from "./base-paths.mjs";
import { mkdirSync } from "fs";
import { copyFileSync, cpSync } from "node:fs";

const cmd = () => {
  const destinationPath = path.join(sdkModsFolder, modName, "Content", "GameLite", "GameData");
  const sourcePath = path.join(modFolderRaw, "Stalker2", "Content", "GameLite", "GameData");
  logger.log(`Pushing raw mod from ${sourcePath} to ${destinationPath}...`);
  if (fs.readdirSync(sourcePath).length === 0) {
    console.error(`No files found in source path: ${sourcePath}`);
    process.exit(1);
  }
  mkdirSync(destinationPath, { recursive: true });
  cpSync(path.join(sourcePath), path.join(destinationPath), { recursive: true });
};

cmd();
