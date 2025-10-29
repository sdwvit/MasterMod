import { EGlobalVariableType, GetStructType, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";

type CluePrototype = GetStructType<{
  ID: number;
  SID: string;
  Description: string;
  Type: EGlobalVariableType;
  DefaultValue: string;
}>;

let oncePerFile = false;
export const getGeneratedStashSID = (i: number) => `Gen_Stash${i}`;
/**
 * Injects 100 generated stash prototype structs into `context.extraStructs` once per file.
 * Each generated struct uses `SID` = `Gen_Stash{n}` and minimal internal metadata.
 * Returns `null` to indicate no modification to the original entries.
 */
export const transformCluePrototypes: EntriesTransformer<CluePrototype> = async (_, context) => {
  if (!oncePerFile) {
    oncePerFile = true;

    for (let i = 1; i <= 100; i++) {
      context.extraStructs.push(
        new Struct({
          __internal__: {
            refkey: "[0]",
            rawName: getGeneratedStashSID(i),
            isRoot: true,
          },
          SID: getGeneratedStashSID(i),
        }) as CluePrototype,
      );
    }
  }

  return null;
};

transformCluePrototypes.files = ["/CluePrototypes.cfg"];
transformCluePrototypes._name = "CluePrototypes";
