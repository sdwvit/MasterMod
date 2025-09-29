import { QuestNodePrototype, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: Meta<QuestNodePrototype>["entriesTransformer"] = (entries) => {
  if (entries.InGameHours) {
    return new Struct({ ...entries, InGameHours: 0 });
  }
  return null;
};
