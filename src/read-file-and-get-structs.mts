import { Struct } from "s2cfgtojson";
import { readFileSync } from "fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

export const readFileAndGetStructs = <T extends Struct>(filePath: string): T[] => {
  return Struct.fromString<T>(readFileSync(path.join(root, "GameLite/GameData/", filePath), "utf8"));
};
