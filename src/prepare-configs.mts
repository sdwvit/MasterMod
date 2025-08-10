import { Entries, Struct } from "s2cfgtojson";
import path from "node:path";
import * as fs from "node:fs";
import dotEnv from "dotenv";
type Context<T> = { struct: T; index: number; array: T[]; filePath: string; rawContent: string; structsById: Record<string, T> };
dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
// scan all local .cfg files
const rootDir = path.join(import.meta.dirname, "..");
const nestedDir = path.join("Stalker2", "Content", "GameLite");
const BASE_CFG_DIR = path.join(process.env.SDK_PATH, nestedDir);
export type Meta<T extends WithSID = WithSID> = {
  changenote: string;
  description: string;
  entriesTransformer?(entries: T["entries"], context: Context<T>): Entries | null; // prefer getEntriesTransformer
  getEntriesTransformer?(context: { filePath: string }): (entries: T["entries"], context: Context<T>) => Entries | null; // use this to transform entries
  interestingContents: string[];
  interestingFiles: string[];
  interestingIds: string[];
  prohibitedIds: string[];
  onFinish?(): void;
};
const emptyMeta = `
  import { Struct, Entries } from "s2cfgtojson";
  type StructType = Struct<{}>;
  export const meta = {
    interestingFiles: [],
    interestingContents: [],
    prohibitedIds: [],
    interestingIds: [],
    description: "",
    changenote: "",
    getEntriesTransformer: () => (entries: Entries) => entries,
  };
`.trim();

const readOneFile = (file: string) => {
  return fs.readFileSync(file, "utf8");
};

function getCfgFiles() {
  const cfgFiles = [];
  function scanAllDirs(start: string) {
    const files = fs.readdirSync(start);
    for (const file of files) {
      if (fs.lstatSync(path.join(start, file)).isDirectory()) {
        scanAllDirs(path.join(start, file));
      } else if (file.endsWith(".cfg")) {
        cfgFiles.push(path.join(start, file));
      }
    }
  }

  scanAllDirs(BASE_CFG_DIR);
  return cfgFiles;
}

const MOD_NAME = process.env.MOD_NAME;
const modFolder = rootDir;
const modFolderRaw = path.join(modFolder, "raw");
const modFolderSteam = path.join(modFolder, "steamworkshop");

if (!fs.existsSync(modFolderSteam)) fs.mkdirSync(modFolderSteam, { recursive: true });

const metaPath = path.join(modFolder, "src", "meta.mts");
if (!fs.existsSync(metaPath)) fs.writeFileSync(metaPath, emptyMeta);

const { meta } = (await import(metaPath)) as { meta: Meta };
const { interestingIds, interestingFiles, interestingContents, prohibitedIds, getEntriesTransformer = () => meta.entriesTransformer } = meta;

const total = getCfgFiles()
  .filter((file) => interestingFiles.some((i) => file.includes(`/${i}`)))
  .map((filePath) => {
    const rawContent = readOneFile(filePath);
    if (interestingContents.length && !interestingContents.some((i) => rawContent.includes(i))) {
      return;
    }
    const entriesTransformer = getEntriesTransformer({ filePath });
    if (!entriesTransformer) {
      return;
    }
    console.log(`Processing file: ${filePath}`);

    const pathToSave = path.parse(filePath.slice(BASE_CFG_DIR.length + 1));
    const structsById = Struct.fromString<WithSID>(rawContent).reduce(
      (acc, struct) => {
        if (struct.entries.SID) {
          acc[struct.entries.SID] = struct as WithSID;
        }
        return acc;
      },
      {} as Record<string, WithSID>,
    );
    const structs = Object.values(structsById)
      .filter(
        (s): s is WithSID =>
          s.entries.SID &&
          (interestingIds.length ? interestingIds.some((id) => s.entries.SID.includes(id)) : true) &&
          prohibitedIds.every((id) => !s.entries.SID.includes(id)),
      )
      .map((s) => Struct.fromString<WithSID>(s.toString())[0])
      .map((struct, index, array) => {
        struct.refurl = "../" + pathToSave.base;
        struct._refkey = struct.refkey;
        struct.refkey = struct.entries.SID;
        struct._id = `${MOD_NAME}${idIsArrayIndex(struct._id) ? "" : `_${struct._id}`}`;
        if (entriesTransformer)
          (struct as Struct).entries = entriesTransformer(struct.entries, {
            struct,
            index,
            array,
            filePath,
            rawContent,
            structsById,
          });
        if (!struct.entries) {
          return null;
        }
        return struct;
      })
      .filter(Boolean);

    if (structs.length) {
      const cfgEnclosingFolder = path.join(modFolderRaw, nestedDir, pathToSave.dir, pathToSave.name);

      if (!fs.existsSync(cfgEnclosingFolder)) fs.mkdirSync(cfgEnclosingFolder, { recursive: true });
      fs.writeFileSync(path.join(cfgEnclosingFolder, `${MOD_NAME}${pathToSave.base}`), structs.map((s) => s.toString()).join("\n\n"));
    }
    return structs;
  });
meta.onFinish?.();

function idIsArrayIndex(id: string): boolean {
  return id && Struct.isNumber(Struct.extractKeyFromBrackets(id));
}

export type WithSID<T = {}> = Struct<{ SID: string } & T> & { _refkey: Struct["refkey"] };

console.log(`Total: ${total.length} files processed.`);
const writtenFiles = total.filter((s) => s?.length > 0);
console.log(`Total: ${writtenFiles.flat().length} structs in ${writtenFiles.length} files written.`);
console.log("Now packing the mod and injecting into the game...");
await import("./packmod.mjs");
await import("./push-to-sdk.mts");
await import("./update-readme.mjs");
