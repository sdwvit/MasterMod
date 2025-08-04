import { GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Removes timeout for repeating quests.
 */
export const transformRepeatingQuests: Meta["entriesTransformer"] = (
  entries: QuestNodePrototype["entries"],
  { filePath },
) => {
  if (!repeatingQuests.some((q) => filePath.includes(q))) {
    return entries;
  }
  if (entries.InGameHours) {
    return { ...entries, InGameHours: 0 };
  }
  return null;
};

export const repeatingQuests = [
  "QuestNodePrototypes/BodyParts_Malahit.cfg",
  "QuestNodePrototypes/RSQ01.cfg",
  "QuestNodePrototypes/RSQ04.cfg",
  "QuestNodePrototypes/RSQ05.cfg",
  "QuestNodePrototypes/RSQ06_C00___SIDOROVICH.cfg",
  "QuestNodePrototypes/RSQ07_C00_TSEMZAVOD.cfg",
  "QuestNodePrototypes/RSQ08_C00_ROSTOK.cfg",
  "QuestNodePrototypes/RSQ09_C00_MALAHIT.cfg",
  "QuestNodePrototypes/RSQ10_C00_HARPY.cfg",
];

type QuestNodePrototype = GetStructType<{ InGameHours?: number; SID: string }>;
