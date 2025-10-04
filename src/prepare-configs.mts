import { GetStructType, Struct } from "s2cfgtojson";
import path from "node:path";
import * as fs from "node:fs";
import dotEnv from "dotenv";
import { logger } from "./logger.mjs";
import { meta } from "./meta.mts";
import { getCfgFilesForTransformer } from "./get-cfg-files.mjs";
import { spawnSync } from "child_process";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });

// scan all local .cfg files
const rootDir = path.join(import.meta.dirname, "..");
const nestedDir = path.join("Stalker2", "Content", "GameLite");
const BASE_CFG_DIR = path.join(process.env.SDK_PATH, nestedDir);

const MOD_NAME = process.env.MOD_NAME;
const modFolder = rootDir;
const modFolderRaw = path.join(modFolder, "raw");
const modFolderSteam = path.join(modFolder, "steamworkshop");

if (!fs.existsSync(modFolderSteam)) fs.mkdirSync(modFolderSteam, { recursive: true });
const transformerCfgCacheName = ".transformer.cache.json";
const transformerCfgCache: Record<string, string[]> = fs.existsSync(path.join(transformerCfgCacheName))
  ? Object.fromEntries(
      JSON.parse(fs.readFileSync(path.join(transformerCfgCacheName)).toString()).map(([k, v]: [string, string[]]) => [
        k,
        v.map((e) => path.join(BASE_CFG_DIR, e)),
      ]),
    )
  : {};
const total = meta.structTransformers.reduce((acc, transformer) => {
  const processedStructs = getCfgFilesForTransformer(transformer, transformerCfgCache).flatMap((filePath, fileIndex) => {
    const pathToSave = path.parse(filePath.slice(BASE_CFG_DIR.length + 1));
    const rawContent = fs.readFileSync(filePath, "utf8");

    if (!(filePath.includes("SpawnActorPrototypes/WorldMap_WP/") && !filePath.endsWith("0.cfg"))) {
      logger.log(`Processing file: ${filePath}`);
    }
    const array = Struct.fromString(rawContent) as GetStructType<{}>[];

    const structsById: Record<string, Struct> = Object.fromEntries(array.map((s) => [s.__internal__.rawName, s]));

    const extraStructs = [];
    const processedStructs: Struct[] = [];

    for (let index = 0; index < array.length; index++) {
      const s = array[index];
      const id = s.__internal__.rawName;
      if (!id) continue;
      const clone = s.fork(true);
      clone.__internal__.rawName = id;
      clone.__internal__.refkey = id;
      clone.__internal__.refurl = "../" + pathToSave.base;
      const processedStruct = transformer(clone, {
        index,
        fileIndex,
        array,
        filePath,
        structsById,
        extraStructs,
      });

      if (processedStruct) {
        delete processedStruct.__internal__.refkey;
        delete processedStruct.__internal__.refurl;

        processedStructs.push(processedStruct);
      }
    }
    processedStructs.push(...extraStructs.filter(Boolean));

    if (processedStructs.length) {
      const cfgEnclosingFolder = path.join(modFolderRaw, nestedDir, pathToSave.dir, pathToSave.name);

      if (!fs.existsSync(cfgEnclosingFolder)) fs.mkdirSync(cfgEnclosingFolder, { recursive: true });
      const resultingFilename = path.join(cfgEnclosingFolder, `${pathToSave.name}_patch_${MOD_NAME}.cfg`);
      fs.writeFileSync(resultingFilename, processedStructs.map((s) => s.toString()).join("\n\n"));
    }
    return processedStructs;
  });
  acc.push(...processedStructs);
  return acc;
}, []);

meta.onFinish?.();

logger.log(`Total: ${total.length} files processed.`);
const writtenFiles = total.filter((s) => s?.length > 0);
logger.log(`Total: ${writtenFiles.flat().length} structs in ${writtenFiles.length} files written.`);
logger.log("Now packing the mod and injecting into the game...");
//await import("./packmod.mjs");
await import("./push-to-sdk.mts");
await import("./update-readme.mjs");
logger.log("Writing transformer cache to " + transformerCfgCacheName);
fs.writeFileSync(
  path.join(transformerCfgCacheName),
  JSON.stringify(Object.entries(transformerCfgCache).map(([k, v]) => [k, v.map((e) => e.slice(BASE_CFG_DIR.length + 1))])),
);
spawnSync("paplay", ["./pop.wav"]);
