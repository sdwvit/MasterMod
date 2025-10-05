import fs, { lstatSync } from "node:fs";
import path from "node:path";
import { baseCfgDir } from "./base-paths.mjs";
import { L3Cache, L3CacheState } from "./l3-cache.mjs";
import { logger } from "./logger.mjs";

export async function getCfgFiles(suffix = "", contains = false): Promise<string[]> {
  if (L3Cache[suffix]?.length) {
    logger.log(`Using cached .cfg files for suffix "${suffix}" (${L3Cache[suffix].length} files)`);
    return L3Cache[suffix];
  }
  L3CacheState.needsUpdate = true;
  const cfgFiles: string[] = L3Cache["*"] ?? [];

  /**
   * scan all local .cfg files
   */
  function scanAllDirs(start: string): void {
    const files = fs.readdirSync(start);
    for (const file of files) {
      if (lstatSync(path.join(start, file)).isDirectory() && !file.includes("DLCGameData")) {
        scanAllDirs(path.join(start, file));
      } else if (file.endsWith(".cfg")) {
        cfgFiles.push(path.join(start, file));
      }
    }
  }

  if (!cfgFiles.length) {
    logger.log("Scanning all .cfg files in " + baseCfgDir);
    scanAllDirs(baseCfgDir);
  }
  L3Cache["*"] = cfgFiles;
  if (suffix) {
    if (contains) {
      L3Cache[suffix] = cfgFiles.filter((f: string) => f.includes(suffix));
    } else {
      L3Cache[suffix] = cfgFiles.filter((f) => f.endsWith(suffix));
    }
  }

  return L3Cache[suffix];
}
