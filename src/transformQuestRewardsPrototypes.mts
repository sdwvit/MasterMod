import { ItemGeneratorPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";

const spread = [0.5, 1];

export const REWARD_FORMULA = (min: number, max: number) => [
  Math.round((DIFFICULTY_FACTOR * min * spread[0]) / 2),
  Math.round((DIFFICULTY_FACTOR * max * spread[1]) / 2),
];
/**
 * Increase reward for repeatable quests
 */
export const transformQuestRewardsPrototypes: Meta<ItemGeneratorPrototype>["entriesTransformer"] = (struct: ItemGeneratorPrototype) => {
  if (struct.MoneyGenerator) {
    return Object.assign(struct.fork(), {
      MoneyGenerator: Object.assign(struct.MoneyGenerator.fork(), {
        MinCount: REWARD_FORMULA(struct.MoneyGenerator.MinCount, struct.MoneyGenerator.MaxCount)[0],
        MaxCount: REWARD_FORMULA(struct.MoneyGenerator.MinCount, struct.MoneyGenerator.MaxCount)[1],
      }),
    });
  }
};
