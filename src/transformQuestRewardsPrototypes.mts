import { ItemGeneratorPrototype } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { rewardFormula, SIDRewardMap } from "./rewardFormula.mjs";

/**
 * Increase reward for repeatable quests
 */
export const transformQuestRewardsPrototypes: EntriesTransformer<ItemGeneratorPrototype> = async (struct: ItemGeneratorPrototype) => {
  if (struct.MoneyGenerator) {
    const minmax = SIDRewardMap[struct.SID] as number;
    return Object.assign(struct.fork(), {
      MoneyGenerator: Object.assign(struct.MoneyGenerator.fork(), {
        MinCount: rewardFormula(minmax, minmax)[0],
        MaxCount: rewardFormula(minmax, minmax)[1],
      }),
    });
  }
};
transformQuestRewardsPrototypes.files = [
  "/QuestRewardsPrototypes/RSQ00_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ01_Reward.cfg", // zalissya
  "/QuestRewardsPrototypes/RSQ04_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ05_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ06_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ07_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ08_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ09_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ10_Reward.cfg",
];
transformQuestRewardsPrototypes._name = "Increase reward for repeatable quests";
