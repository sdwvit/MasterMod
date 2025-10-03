import { QuestNodePrototype, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: Meta<QuestNodePrototype>["entriesTransformer"] = (struct) => {
  if (struct.InGameHours) {
    return Object.assign(struct.fork(), { InGameHours: 0 });
  }
};
