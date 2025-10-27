import { Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { modName } from "./base-paths.mjs";

const oncePerFile = new Set<string>();
export const utilQuestSID = `${modName}_util`;
export const randomCacheQuestSID = `${modName}_GiveRandomCache`;
/**
 * Removes timeout for repeating quests.
 */
export const transformQuestPrototypes: EntriesTransformer<Struct> = async (_, context) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(
      new Struct(`
        ${utilQuestSID} : struct.begin
           SID = ${utilQuestSID}
           DLC = None
        struct.end
    `),
    );
    context.extraStructs.push(
      new Struct(`
        ${randomCacheQuestSID} : struct.begin
           SID = ${randomCacheQuestSID}
           DLC = None
        struct.end
    `),
    );
  }
  return null;
};
transformQuestPrototypes._name = "Add some util quests";
transformQuestPrototypes.files = ["/QuestPrototypes/E01_MQ01.cfg"]; // filler
