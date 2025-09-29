import { Struct } from "s2cfgtojson";
import path from "node:path";
import * as fs from "node:fs";
import dotEnv from "dotenv";
import { logger } from "./logger.mjs";
import { meta } from "./meta.mts";
import { getCfgFiles } from "./get-cfg-files.mjs";

type Context<T> = {
  fileIndex: number;
  index: number;
  array: T[];
  extraStructs: T[];
  filePath: string;
  rawContent: string;
  structsById: Record<string, T>;
};
dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });

// scan all local .cfg files
const rootDir = path.join(import.meta.dirname, "..");
const nestedDir = path.join("Stalker2", "Content", "GameLite");
const BASE_CFG_DIR = path.join(process.env.SDK_PATH, nestedDir);
export type Meta<T> = {
  changenote: string;
  description: string;
  entriesTransformer?(entries: T, context: Context<T>): Struct | null; // prefer getEntriesTransformer
  getEntriesTransformer?(context: { filePath: string }): (struct: T, context: Context<T>) => T | null; // use this to transform entries
  interestingContents?: string[];
  interestingIds?: string[];
  prohibitedIds?: string[];
  onFinish?(): void;
};

const MOD_NAME = process.env.MOD_NAME;
const modFolder = rootDir;
const modFolderRaw = path.join(modFolder, "raw");
const modFolderSteam = path.join(modFolder, "steamworkshop");

if (!fs.existsSync(modFolderSteam)) fs.mkdirSync(modFolderSteam, { recursive: true });
const { interestingIds, interestingContents, prohibitedIds, getEntriesTransformer = () => meta.entriesTransformer } = meta;

const total = getCfgFiles(BASE_CFG_DIR).map((filePath, fileIndex) => {
  const entriesTransformer = getEntriesTransformer({ filePath });
  if (!entriesTransformer) {
    return;
  }
  const rawContent = fs.readFileSync(filePath, "utf8");
  if (interestingContents?.length && !interestingContents.some((i) => rawContent.includes(i))) {
    return;
  }
  if (!(filePath.includes("SpawnActorPrototypes/WorldMap_WP/") && !filePath.endsWith("0.cfg"))) {
    logger.log(`Processing file: ${filePath}`);
  }
  const pathToSave = path.parse(filePath.slice(BASE_CFG_DIR.length + 1));
  const array = Struct.fromString(rawContent);

  const structsById: Record<string, Struct> = Object.fromEntries(array.map((s) => [s.__internal__.rawName, s]));

  const extraStructs = [];
  const processedStructs: Struct[] = [];

  for (let index = 0; index < array.length; index++) {
    const s = array[index];
    const id = s.__internal__.rawName;
    if (!id) continue;
    if (interestingIds?.length && !interestingIds.some((i) => id.includes(i))) continue;
    if (prohibitedIds?.length && prohibitedIds.some((i) => id.includes(i))) continue;

    const processedStruct = entriesTransformer(s.clone(), {
      index,
      fileIndex,
      array,
      filePath,
      rawContent,
      structsById,
      extraStructs,
    });

    if (processedStruct) {
      processedStructs.push(processedStruct);
    }
  }
  processedStructs.push(...extraStructs.filter(Boolean));

  if (processedStructs.length) {
    const cfgEnclosingFolder = path.join(modFolderRaw, nestedDir, pathToSave.dir, pathToSave.name);

    if (!fs.existsSync(cfgEnclosingFolder)) fs.mkdirSync(cfgEnclosingFolder, { recursive: true });
    fs.writeFileSync(path.join(cfgEnclosingFolder, `${MOD_NAME}${pathToSave.base}`), processedStructs.map((s) => s.toString()).join("\n\n"));
  }
  return processedStructs;
});
meta.onFinish?.();

logger.log(`Total: ${total.length} files processed.`);
const writtenFiles = total.filter((s) => s?.length > 0);
logger.log(`Total: ${writtenFiles.flat().length} structs in ${writtenFiles.length} files written.`);
logger.log("Now packing the mod and injecting into the game...");
//await import("./packmod.mjs");
await import("./push-to-sdk.mts");
await import("./update-readme.mjs");
