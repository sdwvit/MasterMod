import fs from "node:fs";
import path from "node:path";
import dotEnv from "dotenv";

import { EntriesTransformer } from "./metaType.mjs";
import { logger } from "./logger.mjs";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const allCfgCacheName = ".cache.json";
const nestedDir = path.join("Stalker2", "Content", "GameLite");
const BASE_CFG_DIR = path.join(process.env.SDK_PATH, nestedDir);
let allCfgCache: string[] = fs.existsSync(path.join(allCfgCacheName))
  ? JSON.parse(fs.readFileSync(path.join(allCfgCacheName)).toString()).map((e) => path.join(BASE_CFG_DIR, e))
  : [];

// scan all local .cfg files
export function getCfgFiles(suffix = "", contains = false): string[] {
  if (allCfgCache.length) {
    if (suffix) {
      if (contains) {
        return allCfgCache.filter((f: string) => f.includes(suffix));
      }
      return allCfgCache.filter((f: string) => f.endsWith(suffix));
    }
    return allCfgCache;
  }

  const cfgFiles: string[] = [];

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

  scanAllDirs(BASE_CFG_DIR);
  logger.log("Writing allCfgCache cache to " + allCfgCacheName);
  allCfgCache = cfgFiles;
  fs.writeFileSync(path.join(allCfgCacheName), JSON.stringify(allCfgCache.map((f) => f.slice(BASE_CFG_DIR.length + 1))));
  if (suffix) {
    if (contains) {
      return allCfgCache.filter((f: string) => f.includes(suffix));
    }
    return allCfgCache.filter((f) => f.endsWith(suffix));
  }
  return allCfgCache;
}

export function getCfgFilesForTransformer(transformer: EntriesTransformer<any>, transformerCfgCache: Record<string, string[]>): string[] {
  if (!transformer?.files?.length) {
    logger.warn(`Transformer ${transformer._name} has no files specified.`);
    return [];
  }
  const inCache = transformerCfgCache[transformer._name];
  if (inCache?.length) {
    return inCache;
  }
  transformerCfgCache[transformer._name] = transformer.files.flatMap((suffix) => getCfgFiles(suffix, transformer.contains));
  return transformerCfgCache[transformer._name];
}
