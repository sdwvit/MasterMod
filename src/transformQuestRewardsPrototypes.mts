import { ItemGeneratorPrototype } from "s2cfgtojson";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";

import { EntriesTransformer, MetaType } from "./metaType.mjs";
import { logger } from "./logger.mjs";

const spread = [0.5, 1];

export const REWARD_FORMULA = (min: number, max: number) => [Math.round(min * spread[0]), Math.round(max * spread[1])];
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

const SIDRewardMap = Object.assign(
  {
    RSQ00_reward_var1: 5000,
    RSQ00_reward_var2: 10000,
    RSQ00_reward_var3: 30000,

    RSQ01_reward_var1: 1000,
    RSQ01_reward_var2: 1600,
    RSQ01_reward_var3: 1800,
    RSQ01_reward_var4: 2200,

    RSQ04_reward_var1: 2200,
    RSQ04_reward_var2: 2600,
    RSQ04_reward_var3: 3000,
    RSQ04_reward_var4: 3600,

    RSQ05_reward_var1: 3600,
    RSQ05_reward_var2: 4000,
    RSQ05_reward_var3: 4400,
    RSQ05_reward_var4: 5000,

    RSQ06_reward_var1: 1600,
    RSQ06_reward_var2: 2000,
    RSQ06_reward_var3: 2200,
    RSQ06_reward_var4: 2800,

    RSQ07_reward_var1: 1600,
    RSQ07_reward_var2: 2000,
    RSQ07_reward_var3: 2600,

    RSQ08_reward_var1: 6000,
    RSQ08_reward_var2: 8000,
    RSQ08_reward_var3: 10000,

    RSQ09_reward_var1: 1600,
    RSQ09_reward_var2: 2600,
    RSQ09_reward_var3: 3200,

    RSQ10_reward_var1: 6400,
    RSQ10_reward_var2: 7000,
    RSQ10_reward_var3: 6000,
  },
  {
    RSQ00_reward_var1: 15000, // find common artifact
    RSQ00_reward_var2: 30000, // find uncommon artifact
    RSQ00_reward_var3: 60000, // find rare artifact

    RSQ01_reward_var1: 3200, // bring stash item
    RSQ01_reward_var2: 5000, // kill easy mutants
    RSQ01_reward_var3: 8000, // kill bandits
    RSQ01_reward_var4: 5000, // find dead stalker pda or stalker squad

    RSQ04_reward_var1: 3500, // bandit squad or find dead stalker pda or stalker squad
    RSQ04_reward_var2: 4000, // bandit squad drabadan
    RSQ04_reward_var3: 8000, // bandit squad drabadan
    RSQ04_reward_var4: 10000, // bandit squad

    RSQ05_reward_var1: 6000,
    RSQ05_reward_var2: 8000,
    RSQ05_reward_var3: 9000,
    RSQ05_reward_var4: 10000, // kill bloodsucker

    RSQ06_Reward_var1: 5000, // easy mutants or bring stash item
    RSQ06_Reward_var2: 6000, // zombies or ?
    RSQ06_Reward_var3: 8000, // bandit squad or find dead stalker pda or stalker squad
    RSQ06_Reward_var4: 15800, // bring gun for newbie

    RSQ07_Reward_var1: 5000, // easy mutants or bring stash item
    RSQ07_Reward_var2: 8000, // bandits
    RSQ07_Reward_var3: 8000,

    RSQ08_Reward_var1: 10000,
    RSQ08_Reward_var2: 20000,
    RSQ08_Reward_var3: 30000, // find uncommon artifact

    RSQ09_Reward_var1: 5000, // easy mutants or bring stash item
    RSQ09_Reward_var2: 8000, // bandits ?
    RSQ09_Reward_var3: 10000, // spica turn on devices

    RSQ10_Reward_var1: 10000, // harpy bandits or stalkers
    RSQ10_Reward_var2: 10000, // bring stash item
    RSQ10_Reward_var3: 10000, // harpy bandits or stalkers
  },
);

const DialogRewardMap = Object.assign(
  {
    RSQ10_Dialog_Harpy_RSQ_quest_1_61516: 6400,
    RSQ10_Dialog_Harpy_RSQ_quest_2_61515: 6400,
    RSQ10_Dialog_Harpy_RSQ_quest_3_61517: 7000,
    RSQ10_Dialog_Harpy_RSQ_quest_4_61518: 7000,
    RSQ10_Dialog_Harpy_RSQ_quest_5_61519: 7000,
    RSQ10_Dialog_Harpy_RSQ_quest_6_61520: 30000,
    RSQ10_Dialog_Harpy_RSQ_quest_7_61521: 30000,
    RSQ10_Dialog_Harpy_RSQ_quest_8_61522: 30000,
    RSQ10_Dialog_Harpy_RSQ_special_task_63605: 6000,
    RSQ10_Dialog_Harpy_RSQ_special_task_63605_1: 6000,

    RSQ09_Dialog_Spica_RSQ_quest_1_60448: 2600,
    RSQ09_Dialog_Spica_RSQ_quest_2_60449: 2600,
    RSQ09_Dialog_Spica_RSQ_quest_3_60450: 2600,
    RSQ09_Dialog_Spica_RSQ_quest_4_60451: 2600,
    RSQ09_Dialog_Spica_RSQ_quest_5_60452: 1600,
    RSQ09_Dialog_Spica_RSQ_quest_6_60453: 10000,
    RSQ09_Dialog_Spica_RSQ_quest_7_60454: 30000,
    RSQ09_Dialog_Spica_RSQ_quest_8_60455: 30000,
    RSQ09_Dialog_Spica_RSQ_special_task_63713: 3200,

    RSQ08_Dialog_Barmen_RSQ_quest_1_59229: 8000,
    RSQ08_Dialog_Barmen_RSQ_quest_2_59231: 8000,
    RSQ08_Dialog_Barmen_RSQ_quest_3_59233: 8000,
    RSQ08_Dialog_Barmen_RSQ_quest_4_59235: 6000,
    RSQ08_Dialog_Barmen_RSQ_quest_5_59237: 6000,
    RSQ08_Dialog_Barmen_RSQ_quest_6_59239: 30000,
    RSQ08_Dialog_Barmen_RSQ_quest_7_59241: 10000,
    RSQ08_Dialog_Barmen_RSQ_quest_8_63558: 30000,
    RSQ08_Dialog_Barmen_RSQ_special_task_59227: 10000,
    RSQ07_Dialog_Barmen_RSQ_quest_1_58566: 1600,
    RSQ07_Dialog_Barmen_RSQ_quest_2_58568: 1600,
    RSQ07_Dialog_Barmen_RSQ_quest_3_58570: 1600,
    RSQ07_Dialog_Barmen_RSQ_quest_4_58575: 2000,
    RSQ07_Dialog_Barmen_RSQ_quest_5_58579: 2000,
    RSQ07_Dialog_Barmen_RSQ_quest_6_58586: 10000,
    RSQ07_Dialog_Barmen_RSQ_quest_7_58588: 10000,
    RSQ07_Dialog_Barmen_RSQ_quest_8_58589: 10000,
    RSQ07_Dialog_Barmen_RSQ_special_task_63688: 2600,

    RSQ06_Dialog_Sidorovich_RSQ_quest_1_41221: 2000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_2_41226: 2000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_3_41228: 2200,
    RSQ06_Dialog_Sidorovich_RSQ_quest_4_41230: 2200,
    RSQ06_Dialog_Sidorovich_RSQ_quest_5_41236: 1600,
    RSQ06_Dialog_Sidorovich_RSQ_quest_6_41239: 10000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_7_41241: 3750,
    RSQ06_Dialog_Sidorovich_RSQ_quest_8_41242: 10000,
    RSQ06_Dialog_Sidorovich_RSQ_special_task_63535: 2800,

    RSQ05_Dialog_Sich_RSQ_quest_1_36380: 4000,
    RSQ05_Dialog_Sich_RSQ_quest_2_36381: 4400,
    RSQ05_Dialog_Sich_RSQ_quest_4_36383: 3600,
    RSQ05_Dialog_Sich_RSQ_quest_5_36384: 4400,
    RSQ05_Dialog_Sich_RSQ_quest_7_36386: 10000,
    RSQ05_Dialog_Sich_RSQ_quest_8_36387: 3750,
    RSQ05_Dialog_Sich_RSQ_special_task_63823: 5000,
    RSQ05_Dialog_Sich_RSQ_quest_9_36388: 10000,

    RSQ04_Dialog_Drabadan_RSQ_quest_1_32932: 2600,
    RSQ04_Dialog_Drabadan_RSQ_quest_2_32934: 2600,
    RSQ04_Dialog_Drabadan_RSQ_quest_3_32939: 2600,
    RSQ04_Dialog_Drabadan_RSQ_quest_4_32945: 2200,
    RSQ04_Dialog_Drabadan_RSQ_quest_5_32951: 2200,
    RSQ04_Dialog_Drabadan_RSQ_quest_6_32961: 3000,
    RSQ04_Dialog_Drabadan_RSQ_quest_7_32965: 3750,
    RSQ04_Dialog_Drabadan_RSQ_quest_8_32966: 3750,
    RSQ04_Dialog_Drabadan_RSQ_quest_9_32967: 3750,
    RSQ04_Dialog_Drabadan_RSQ_special_task_63727: 3600,

    RSQ01_Dialog_Warlock_RSQ_Quest_1_25545: 1000, // bandits
    RSQ01_Dialog_Warlock_RSQ_Quest_2_25546: 1600, // dogs or fleshes or bandits
    RSQ01_Dialog_Warlock_RSQ_Quest_3_1stTime_25547: 3750, // bring artifact
    RSQ01_Dialog_Warlock_RSQ_Quest_4_25555: 1800, // missing person
    RSQ01_Dialog_Warlock_RSQ_Quest_5_25557: 1600, // dogs or fleshes or bandits
    RSQ01_Dialog_Warlock_RSQ_Quest_6_25561: 2200, //
  },
  {
    RSQ10_Dialog_Harpy_RSQ_quest_1_61516: 10000, // upd
    RSQ10_Dialog_Harpy_RSQ_quest_2_61515: 10000, // upd
    RSQ10_Dialog_Harpy_RSQ_quest_3_61517: 10000, // upd
    RSQ10_Dialog_Harpy_RSQ_quest_4_61518: 10000, // upd
    RSQ10_Dialog_Harpy_RSQ_quest_5_61519: 10000, // upd
    RSQ10_Dialog_Harpy_RSQ_quest_6_61520: 60000, // upd
    RSQ10_Dialog_Harpy_RSQ_quest_7_61521: 60000, // upd
    RSQ10_Dialog_Harpy_RSQ_quest_8_61522: 60000, // upd
    RSQ10_Dialog_Harpy_RSQ_special_task_63605: 10000, // upd
    RSQ10_Dialog_Harpy_RSQ_special_task_63605_1: 10000, // upd

    RSQ09_Dialog_Spica_RSQ_quest_1_60448: 4000, // upd
    RSQ09_Dialog_Spica_RSQ_quest_2_60449: 4000, // upd
    RSQ09_Dialog_Spica_RSQ_quest_3_60450: 4000, // upd
    RSQ09_Dialog_Spica_RSQ_quest_4_60451: 4000, // upd
    RSQ09_Dialog_Spica_RSQ_quest_5_60452: 5000, // upd
    RSQ09_Dialog_Spica_RSQ_quest_6_60453: 30000, // upd
    RSQ09_Dialog_Spica_RSQ_quest_7_60454: 60000, // upd
    RSQ09_Dialog_Spica_RSQ_quest_8_60455: 60000, // upd
    RSQ09_Dialog_Spica_RSQ_special_task_63713: 10000, // upd

    RSQ08_Dialog_Barmen_RSQ_quest_1_59229: 20000, // upd
    RSQ08_Dialog_Barmen_RSQ_quest_2_59231: 20000, // upd
    RSQ08_Dialog_Barmen_RSQ_quest_3_59233: 20000, // upd
    RSQ08_Dialog_Barmen_RSQ_quest_4_59235: 10000, // upd
    RSQ08_Dialog_Barmen_RSQ_quest_5_59237: 10000, // upd
    RSQ08_Dialog_Barmen_RSQ_quest_6_59239: 60000, // upd
    RSQ08_Dialog_Barmen_RSQ_quest_7_59241: 30000, // upd
    RSQ08_Dialog_Barmen_RSQ_quest_8_63558: 60000, // upd
    RSQ08_Dialog_Barmen_RSQ_special_task_59227: 30000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_1_58566: 5000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_2_58568: 5000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_3_58570: 5000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_4_58575: 8000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_5_58579: 8000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_6_58586: 30000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_7_58588: 30000, // upd
    RSQ07_Dialog_Barmen_RSQ_quest_8_58589: 30000, // upd
    RSQ07_Dialog_Barmen_RSQ_special_task_63688: 8000, // upd

    RSQ06_Dialog_Sidorovich_RSQ_quest_1_41221: 8000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_2_41226: 8000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_3_41228: 8000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_4_41230: 8000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_5_41236: 5000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_6_41239: 30000,
    RSQ06_Dialog_Sidorovich_RSQ_quest_7_41241: 7000, // up
    RSQ06_Dialog_Sidorovich_RSQ_quest_8_41242: 30000,
    RSQ06_Dialog_Sidorovich_RSQ_special_task_63535: 2800,

    RSQ05_Dialog_Sich_RSQ_quest_1_36380: 4000,
    RSQ05_Dialog_Sich_RSQ_quest_2_36381: 4400,
    RSQ05_Dialog_Sich_RSQ_quest_4_36383: 3600,
    RSQ05_Dialog_Sich_RSQ_quest_5_36384: 4400,
    RSQ05_Dialog_Sich_RSQ_quest_7_36386: 10000,
    RSQ05_Dialog_Sich_RSQ_quest_8_36387: 7000,
    RSQ05_Dialog_Sich_RSQ_special_task_63823: 5000,
    RSQ05_Dialog_Sich_RSQ_quest_9_36388: 10000,

    RSQ04_Dialog_Drabadan_RSQ_quest_1_32932: 2600,
    RSQ04_Dialog_Drabadan_RSQ_quest_2_32934: 2600,
    RSQ04_Dialog_Drabadan_RSQ_quest_3_32939: 2600,
    RSQ04_Dialog_Drabadan_RSQ_quest_4_32945: 2200,
    RSQ04_Dialog_Drabadan_RSQ_quest_5_32951: 2200,
    RSQ04_Dialog_Drabadan_RSQ_quest_6_32961: 3000,
    RSQ04_Dialog_Drabadan_RSQ_quest_7_32965: 7000,
    RSQ04_Dialog_Drabadan_RSQ_quest_8_32966: 7000,
    RSQ04_Dialog_Drabadan_RSQ_quest_9_32967: 7000,
    RSQ04_Dialog_Drabadan_RSQ_special_task_63727: 3600,

    RSQ01_Dialog_Warlock_RSQ_Quest_1_25545: 8000,
    RSQ01_Dialog_Warlock_RSQ_Quest_2_25546: 5000,
    RSQ01_Dialog_Warlock_RSQ_Quest_3_1stTime_25547: 15000,
    RSQ01_Dialog_Warlock_RSQ_Quest_4_25555: 5000,
    RSQ01_Dialog_Warlock_RSQ_Quest_5_25557: 5000,
    RSQ01_Dialog_Warlock_RSQ_Quest_6_25561: 5000,
  },
);
