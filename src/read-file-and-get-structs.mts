import { Struct } from "s2cfgtojson";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { L1Cache, L1CacheState } from "./l1-cache.mjs";
import { baseCfgDir } from "./base-paths.mjs";

export const readFileAndGetStructs = async <T extends Struct>(filePath: string, filePreprocess?: (fileContents: string) => string): Promise<T[]> => {
  const fullPath = path.join(baseCfgDir, "GameData", filePath);

  if (L1Cache[fullPath] && !filePreprocess) {
    console.log(`Using L1 cache for file: ${fullPath}`);
    return L1Cache[fullPath] as T[];
  } else {
    const fileContents = await readFile(fullPath, "utf8");
    const processed = filePreprocess ? filePreprocess(fileContents) : fileContents;
    L1Cache[fullPath] = Struct.fromString<T>(processed);
    if (!filePreprocess) L1CacheState.needsUpdate = true;
    return L1Cache[fullPath] as T[];
  }
};
