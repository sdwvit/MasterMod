import { QuestNodePrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";

/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: EntriesTransformer<QuestNodePrototype> = (struct) => {
  if (struct.InGameHours) {
    return Object.assign(struct.fork(), { InGameHours: 0 });
  }
};
transformQuestNodePrototypes._name = "Remove quest timeouts";
transformQuestNodePrototypes.files = [
  "/QuestNodePrototypes/BodyParts_Malahit.cfg",
  "/QuestNodePrototypes/RSQ01.cfg",
  "/QuestNodePrototypes/RSQ04.cfg",
  "/QuestNodePrototypes/RSQ05.cfg",
  "/QuestNodePrototypes/RSQ06_C00___SIDOROVICH.cfg",
  "/QuestNodePrototypes/RSQ07_C00_TSEMZAVOD.cfg",
  "/QuestNodePrototypes/RSQ08_C00_ROSTOK.cfg",
  "/QuestNodePrototypes/RSQ09_C00_MALAHIT.cfg",
  "/QuestNodePrototypes/RSQ10_C00_HARPY.cfg",
];
