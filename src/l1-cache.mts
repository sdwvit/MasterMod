import { Struct } from "s2cfgtojson";
import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger.mjs";
import { readWithUnzip, writeWithZip } from "./zip.mjs";

const L1CacheFileName = ".l1.cache.gzip";
export const L1CacheState = {
  needsUpdate: false,
};
export const L1Cache: Record<string, Struct[]> = fs.existsSync(path.join(L1CacheFileName))
  ? Object.fromEntries(
      JSON.parse(await readWithUnzip(path.join(L1CacheFileName))).map(([k, v]: [string, any]) => [k, v.map((e: any) => Struct.fromJson(e, true))]),
    )
  : {};

export const onL1Finish = () => {
  if (!L1CacheState.needsUpdate) return;
  logger.log("Writing L1 cache to " + L1CacheFileName);
  return writeWithZip(path.join(L1CacheFileName), JSON.stringify(Object.entries(L1Cache).map(([k, v]) => [k, v.map((e) => e.toJson(true))])));
};
