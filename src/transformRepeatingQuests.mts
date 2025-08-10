import { GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Removes timeout for repeating quests.
 */
export const transformRepeatingQuests: Meta["entriesTransformer"] = (entries: QuestNodePrototype["entries"]) => {
  if (entries.InGameHours) {
    return { ...entries, InGameHours: 0 };
  }
  return null;
};

type QuestNodePrototype = GetStructType<{ InGameHours?: number; SID: string }>;
