import { QuestItemPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

/**
 * Remove an essential flag from various items
 */
export const transformQuestItemPrototypes: EntriesTransformer<QuestItemPrototype> = async (struct) => {
  if (struct.IsQuestItem) {
    return Object.assign(struct.fork(), { IsQuestItem: false });
  }
  return null;
};
transformQuestItemPrototypes.files = ["/QuestItemPrototypes.cfg"];
transformQuestItemPrototypes._name = "Remove an essential flag from QuestItemPrototypes";
