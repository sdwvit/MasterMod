import fs from "node:fs";
import path from "node:path";
import { baseCfgDir } from "./base-paths.mjs";
import { logger } from "./logger.mjs";
import { writeFile } from "node:fs/promises";

export const L2CacheFileName = ".l2.cache.json";
export const L2CacheState = {
  needsUpdate: false,
};
export const L2Cache = fs.existsSync(path.join(L2CacheFileName))
  ? Object.fromEntries(
      JSON.parse(fs.readFileSync(path.join(L2CacheFileName)).toString()).map(([k, v]) => [k, v.map((e) => path.join(baseCfgDir, e))]),
    )
  : {};

export const onL2Finish = () => {
  if (!L2CacheState.needsUpdate) return;
  logger.log("Writing L2 cache to " + L2CacheFileName);
  return writeFile(
    path.join(L2CacheFileName),
    JSON.stringify(Object.entries(L2Cache).map(([k_1, v_1]) => [k_1, v_1.map((e_1) => e_1.slice(baseCfgDir.length + 1))])),
  );
};
