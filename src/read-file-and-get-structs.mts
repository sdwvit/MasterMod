import { Struct } from "s2cfgtojson";
import { readFileSync } from "fs";
import path from "node:path";
import { readFile } from "node:fs/promises";

const root = path.resolve(import.meta.dirname, "..");

export const readFileAndGetStructs = async <T extends Struct>(
  filePath: string,
  filePreprocess: (fileContents: string) => string = (s) => s,
): Promise<T[]> => {
  return Struct.fromString<T>(filePreprocess(await readFile(path.join(root, "GameLite/GameData/", filePath), "utf8")));
};
