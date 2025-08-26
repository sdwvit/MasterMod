import { QuestNodePrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: Meta["entriesTransformer"] = (entries: QuestNodePrototype["entries"]) => {
  if (entries.InGameHours) {
    return { ...entries, InGameHours: 0 };
  }
  return null;
};
