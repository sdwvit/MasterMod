import fs from "node:fs";
import path from "node:path";
import dotEnv from "dotenv";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });

// scan all local .cfg files
export function getCfgFiles(baseDir: string) {
  const cfgFiles = [];

  function scanAllDirs(start: string) {
    const files = fs.readdirSync(start);
    for (const file of files) {
      if (fs.lstatSync(path.join(start, file)).isDirectory() && !file.includes("DLCGameData")) {
        scanAllDirs(path.join(start, file));
      } else if (file.endsWith(".cfg")) {
        cfgFiles.push(path.join(start, file));
      }
    }
  }

  scanAllDirs(baseDir);
  return cfgFiles;
}
