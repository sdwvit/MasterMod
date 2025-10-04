import { ItemGeneratorPrototype } from "s2cfgtojson";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";

import { EntriesTransformer, MetaType } from "./metaType.mjs";

const spread = [0.5, 1];

export const REWARD_FORMULA = (min: number, max: number) => [
  Math.round((DIFFICULTY_FACTOR * min * spread[0]) / 2),
  Math.round((DIFFICULTY_FACTOR * max * spread[1]) / 2),
];
/**
 * Increase reward for repeatable quests
 */
export const transformQuestRewardsPrototypes: EntriesTransformer<ItemGeneratorPrototype> = (struct: ItemGeneratorPrototype) => {
  if (struct.MoneyGenerator) {
    return Object.assign(struct.fork(), {
      MoneyGenerator: Object.assign(struct.MoneyGenerator.fork(), {
        MinCount: REWARD_FORMULA(struct.MoneyGenerator.MinCount, struct.MoneyGenerator.MaxCount)[0],
        MaxCount: REWARD_FORMULA(struct.MoneyGenerator.MinCount, struct.MoneyGenerator.MaxCount)[1],
      }),
    });
  }
};
transformQuestRewardsPrototypes.files = [
  "/QuestRewardsPrototypes/RSQ00_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ01_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ04_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ05_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ06_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ07_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ08_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ09_Reward.cfg",
  "/QuestRewardsPrototypes/RSQ10_Reward.cfg",
];
transformQuestRewardsPrototypes._name = "Increase reward for repeatable quests";
