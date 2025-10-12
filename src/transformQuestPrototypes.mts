import { Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { modName } from "./base-paths.mjs";

const oncePerFile = new Set<string>();
export const utilQuestSID = `${modName}_util`;
/**
 * Removes timeout for repeating quests.
 */
export const transformQuestPrototypes: EntriesTransformer<Struct> = (_, context) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    const specialQuest = new Struct(`
        ${utilQuestSID} : struct.begin
           SID = ${utilQuestSID}
           DLC = None
        struct.end
    `);
    context.extraStructs.push(specialQuest);
  }
  return null;
};
transformQuestPrototypes._name = "Add some util quests";
transformQuestPrototypes.files = ["/E01_MQ01.cfg"]; // filler
