import { ItemGeneratorPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";
import { logger } from "./logger.mjs";

const spread = [0.5, 1];

export const REWARD_FORMULA = (min: number, max: number) => [
  Math.round((DIFFICULTY_FACTOR * min * spread[0]) / 2),
  Math.round((DIFFICULTY_FACTOR * max * spread[1]) / 2),
];
/**
 * Increase reward for repeatable quests
 */
export const transformQuestRewardsPrototypes: Meta<ItemGeneratorPrototype>["entriesTransformer"] = (entries: ItemGeneratorPrototype) => {
  if (entries.MoneyGenerator) {
    const min = entries.MoneyGenerator.MinCount;
    const max = entries.MoneyGenerator.MaxCount;
    [entries.MoneyGenerator.MinCount, entries.MoneyGenerator.MaxCount] = REWARD_FORMULA(min, max);
    logger.info(
      `Increased quest reward for ${entries.SID} from [${min}, ${max}] to [${entries.MoneyGenerator.MinCount}, ${entries.MoneyGenerator.MaxCount}] (x${DIFFICULTY_FACTOR})`,
    );
    return entries;
  }

  return null;
};
