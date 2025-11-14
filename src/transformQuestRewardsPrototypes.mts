import { ItemGeneratorPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { QuestDataTable, rewardFormula } from "./rewardFormula.mjs";

let oncePerTransformer = false;
/**
 * Increase reward for repeatable quests
 */
export const transformQuestRewardsPrototypes: EntriesTransformer<ItemGeneratorPrototype> = async (struct, context) => {
  if (!oncePerTransformer) {
    oncePerTransformer = true;
    const extraStructs: ItemGeneratorPrototype[] = [];
    QuestDataTable.forEach((qv) => {
      const rewardStruct = struct.fork();
      rewardStruct.SID = qv["Reward Gen SID"];
      rewardStruct.__internal__.rawName = qv["Reward Gen SID"];
      const [min, max] = rewardFormula(parseInt(qv["Suggested Reward"], 10));
      rewardStruct.MoneyGenerator = new Struct({ MinCount: min, MaxCount: max }) as any;
      extraStructs.push(rewardStruct);
    });
    return extraStructs;
  }
  return null;
};
transformQuestRewardsPrototypes.files = ["/QuestRewardsPrototypes/RSQ00_Reward.cfg"];
