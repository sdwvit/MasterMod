import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger.mjs";
import { readWithUnzip, writeWithZip } from "./zip.mjs";

export const L2CacheFileName = ".l2.cache.gzip";
export const L2CacheState = {
  needsUpdate: false,
};
export const L2Cache = fs.existsSync(path.join(L2CacheFileName)) ? JSON.parse(await readWithUnzip(path.join(L2CacheFileName))) : {};

export const onL2Finish = () => {
  if (!L2CacheState.needsUpdate) return;
  logger.log("Writing L2 cache to " + L2CacheFileName);
  return writeWithZip(path.join(L2CacheFileName), JSON.stringify(L2Cache));
};
