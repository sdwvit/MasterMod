import { EGlobalVariableType, GetStructType, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { QuestDataTable } from "./rewardFormula.mjs";

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
 * Injects 100 generated stash clue prototypes into CluePrototypes.cfg
 * Each generated struct uses `SID` = `Gen_Stash{n}` and minimal internal metadata.
 * Returns `null` to indicate no modification to the original entries.
 */
export const transformCluePrototypes: EntriesTransformer<CluePrototype> = async (_) => {
  if (!oncePerFile) {
    oncePerFile = true;
    const extraStructs: CluePrototype[] = [];
    [...new Set(QuestDataTable.map((q) => `${q.Vendor.replace(/\W/g, "")}_latest_quest_variant`))].forEach((SID) => {
      extraStructs.push(
        new Struct(`
          ${SID} : struct.begin {refkey=[0]}
             SID = ${SID}
             Type = EGlobalVariableType::Int
             DefaultValue = 0
          struct.end
      `) as CluePrototype,
      );
    });
    for (let i = 1; i <= 100; i++) {
      extraStructs.push(
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
    return extraStructs;
  }

  return null;
};

transformCluePrototypes.files = ["/CluePrototypes.cfg"];
