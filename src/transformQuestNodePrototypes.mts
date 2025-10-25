import { QuestNodePrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer, MetaContext } from "./metaType.mjs";
import { utilQuestSID } from "./transformQuestPrototypes.mjs";
import { questItemSIDs } from "./questItemSIDs.mjs";

let oncePerTransformer = false;

/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: EntriesTransformer<QuestNodePrototype> = (struct, context) => {
  if (struct.InGameHours) {
    return Object.assign(struct.fork(), { InGameHours: 0 });
  }

  if (!oncePerTransformer) {
    oncePerTransformer = true;
    injectQuestNodeExtras(context);
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

function injectQuestNodeExtras(context: MetaContext<QuestNodePrototype>) {
  const getQuestNodeStruct = (itemPrototypeSID: string) =>
    new Struct(`
      ${utilQuestSID}_SwitchQuestItemState_${itemPrototypeSID} : struct.begin
         SID = ${utilQuestSID}_SwitchQuestItemState_${itemPrototypeSID}
         NodePrototypeVersion = 1
         QuestSID = ${utilQuestSID}
         NodeType = EQuestNodeType::SwitchQuestItemState
         
         Launchers : struct.begin
            [0] : struct.begin
               Excluding = false
               Connections : struct.begin
                  [0] : struct.begin
                     SID = ${utilQuestSID}_Start
                     Name =
                  struct.end
               struct.end
            struct.end
         struct.end
          
         ItemPrototypeSID = ${itemPrototypeSID}
         QuestItem = false
      struct.end
    `) as QuestNodePrototype;

  const specialQuestNode = new Struct(`
      ${utilQuestSID}_Start : struct.begin
         SID = ${utilQuestSID}_Start
         NodePrototypeVersion = 1
         QuestSID = ${utilQuestSID}
         NodeType = EQuestNodeType::Technical
         StartDelay = 0
         LaunchOnQuestStart = true
      struct.end
    `) as QuestNodePrototype;
  context.extraStructs.push(specialQuestNode);
  questItemSIDs.forEach((questItemSID) => context.extraStructs.push(getQuestNodeStruct(questItemSID)));
}
