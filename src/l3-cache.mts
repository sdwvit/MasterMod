import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger.mjs";
import { readWithUnzip, writeWithZip } from "./zip.mjs";

const L3CacheFileName = ".l3.cache.gzip";
export const L3CacheState = {
  needsUpdate: false,
};
export const L3Cache: Record<string, string[]> = fs.existsSync(L3CacheFileName)
  ? Object.fromEntries(JSON.parse(await readWithUnzip(L3CacheFileName)))
  : {};

export const onL3Finish = () => {
  if (!L3CacheState.needsUpdate) return;
  logger.log("Writing L3 cache to " + L3CacheFileName);
  const L3Entries = Object.entries(L3Cache);

  return writeWithZip(path.join(L3CacheFileName), JSON.stringify(L3Entries));
};
