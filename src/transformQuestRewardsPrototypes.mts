import { EUISound, GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";
import { logger } from "./logger.mjs";

const spread = [0.75, 1.25];

export const REWARD_FORMULA = (min: number, max: number) => [
  Math.round(DIFFICULTY_FACTOR * min * spread[0]),
  Math.round(DIFFICULTY_FACTOR * max * spread[1]),
];
/**
 * Increase reward for repeatable quests
 */
export const transformQuestRewardsPrototypes: Meta["entriesTransformer"] = (entries: QuestRewardsPrototype["entries"], context) => {
  if (entries.MoneyGenerator) {
    const min = entries.MoneyGenerator.entries.MinCount;
    const max = entries.MoneyGenerator.entries.MaxCount;
    entries.MoneyGenerator.entries.MinCount = Math.round(DIFFICULTY_FACTOR * min * spread[0]);
    entries.MoneyGenerator.entries.MaxCount = Math.round(DIFFICULTY_FACTOR * max * spread[1]);
    logger.info(
      `Increased quest reward for ${entries.SID} from [${min}, ${max}] to [${entries.MoneyGenerator.entries.MinCount}, ${entries.MoneyGenerator.entries.MaxCount}] (x${DIFFICULTY_FACTOR})`,
    );
    return entries;
  }

  return null;
};

type QuestRewardsPrototype = GetStructType<{
  SID: string;
  SpecificRewardSound?: EUISound;
  MoneyGenerator: {
    MinCount: number;
    MaxCount: number;
  };
}>;
