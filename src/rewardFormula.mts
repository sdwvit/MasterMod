const spread = [0.5, 1];

export const SIDRewardMap = {
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

  RSQ06_reward_var1: 5000, // easy mutants or bring stash item
  RSQ06_reward_var2: 6000, // zombies or ?
  RSQ06_reward_var3: 8000, // bandit squad or find dead stalker pda or stalker squad
  RSQ06_reward_var4: 15800, // bring gun for newbie

  RSQ07_reward_var1: 5000, // easy mutants or bring stash item
  RSQ07_reward_var2: 8000, // bandits
  RSQ07_reward_var3: 8000,

  RSQ08_reward_var1: 10000,
  RSQ08_reward_var2: 20000,
  RSQ08_reward_var3: 30000, // find uncommon artifact

  RSQ09_reward_var1: 5000, // easy mutants or bring stash item
  RSQ09_reward_var2: 8000, // bandits ?
  RSQ09_reward_var3: 10000, // spica turn on devices

  RSQ10_reward_var1: 10000, // harpy bandits or stalkers
  RSQ10_reward_var2: 10000, // bring stash item
  RSQ10_reward_var3: 10000, // harpy bandits or stalkers
};

export const DialogRewardMap = {
  RSQ10_Dialog_Harpy_RSQ_quest_1_61516: SIDRewardMap.RSQ10_reward_var1,
  RSQ10_Dialog_Harpy_RSQ_quest_2_61515: SIDRewardMap.RSQ10_reward_var1,
  RSQ10_Dialog_Harpy_RSQ_quest_3_61517: SIDRewardMap.RSQ10_reward_var1,
  RSQ10_Dialog_Harpy_RSQ_quest_4_61518: SIDRewardMap.RSQ10_reward_var1,
  RSQ10_Dialog_Harpy_RSQ_quest_5_61519: SIDRewardMap.RSQ10_reward_var1,
  RSQ10_Dialog_Harpy_RSQ_quest_6_61520: SIDRewardMap.RSQ00_reward_var3,
  RSQ10_Dialog_Harpy_RSQ_quest_7_61521: SIDRewardMap.RSQ00_reward_var3,
  RSQ10_Dialog_Harpy_RSQ_quest_8_61522: SIDRewardMap.RSQ00_reward_var3,
  RSQ10_Dialog_Harpy_RSQ_special_task_63605: SIDRewardMap.RSQ10_reward_var3,
  RSQ10_Dialog_Harpy_RSQ_special_task_63605_1: SIDRewardMap.RSQ10_reward_var3,

  RSQ09_Dialog_Spica_RSQ_quest_1_60448: SIDRewardMap.RSQ04_reward_var2,
  RSQ09_Dialog_Spica_RSQ_quest_2_60449: SIDRewardMap.RSQ04_reward_var2,
  RSQ09_Dialog_Spica_RSQ_quest_3_60450: SIDRewardMap.RSQ04_reward_var2,
  RSQ09_Dialog_Spica_RSQ_quest_4_60451: SIDRewardMap.RSQ04_reward_var2,
  RSQ09_Dialog_Spica_RSQ_quest_5_60452: SIDRewardMap.RSQ01_reward_var2,
  RSQ09_Dialog_Spica_RSQ_quest_6_60453: SIDRewardMap.RSQ08_reward_var3,
  RSQ09_Dialog_Spica_RSQ_quest_7_60454: SIDRewardMap.RSQ00_reward_var3,
  RSQ09_Dialog_Spica_RSQ_quest_8_60455: SIDRewardMap.RSQ00_reward_var3,
  RSQ09_Dialog_Spica_RSQ_special_task_63713: SIDRewardMap.RSQ09_reward_var3,

  RSQ08_Dialog_Barmen_RSQ_quest_1_59229: SIDRewardMap.RSQ08_reward_var2,
  RSQ08_Dialog_Barmen_RSQ_quest_2_59231: SIDRewardMap.RSQ08_reward_var2,
  RSQ08_Dialog_Barmen_RSQ_quest_3_59233: SIDRewardMap.RSQ08_reward_var2,
  RSQ08_Dialog_Barmen_RSQ_quest_4_59235: SIDRewardMap.RSQ09_reward_var3,
  RSQ08_Dialog_Barmen_RSQ_quest_5_59237: SIDRewardMap.RSQ09_reward_var3,
  RSQ08_Dialog_Barmen_RSQ_quest_6_59239: SIDRewardMap.RSQ00_reward_var3,
  RSQ08_Dialog_Barmen_RSQ_quest_7_59241: SIDRewardMap.RSQ08_reward_var3,
  RSQ08_Dialog_Barmen_RSQ_quest_8_63558: SIDRewardMap.RSQ00_reward_var3,
  RSQ08_Dialog_Barmen_RSQ_special_task_59227: SIDRewardMap.RSQ08_reward_var3,

  RSQ07_Dialog_Barmen_RSQ_quest_1_58566: SIDRewardMap.RSQ01_reward_var2, // RSQ07_C00_TSEMZAVOD
  RSQ07_Dialog_Barmen_RSQ_quest_2_58568: SIDRewardMap.RSQ01_reward_var2,
  RSQ07_Dialog_Barmen_RSQ_quest_3_58570: SIDRewardMap.RSQ01_reward_var2,
  RSQ07_Dialog_Barmen_RSQ_quest_4_58575: SIDRewardMap.RSQ07_reward_var2,
  RSQ07_Dialog_Barmen_RSQ_quest_5_58579: SIDRewardMap.RSQ07_reward_var2,
  RSQ07_Dialog_Barmen_RSQ_quest_6_58586: SIDRewardMap.RSQ08_reward_var3,
  RSQ07_Dialog_Barmen_RSQ_quest_7_58588: SIDRewardMap.RSQ08_reward_var3,
  RSQ07_Dialog_Barmen_RSQ_quest_8_58589: SIDRewardMap.RSQ08_reward_var3,
  RSQ07_Dialog_Barmen_RSQ_special_task_63688: SIDRewardMap.RSQ07_reward_var2,

  RSQ06_Dialog_Sidorovich_RSQ_quest_1_41221: SIDRewardMap.RSQ07_reward_var2,
  RSQ06_Dialog_Sidorovich_RSQ_quest_2_41226: SIDRewardMap.RSQ07_reward_var2,
  RSQ06_Dialog_Sidorovich_RSQ_quest_3_41228: SIDRewardMap.RSQ07_reward_var2,
  RSQ06_Dialog_Sidorovich_RSQ_quest_4_41230: SIDRewardMap.RSQ07_reward_var2,
  RSQ06_Dialog_Sidorovich_RSQ_quest_5_41236: SIDRewardMap.RSQ01_reward_var2,
  RSQ06_Dialog_Sidorovich_RSQ_quest_6_41239: SIDRewardMap.RSQ08_reward_var3,
  RSQ06_Dialog_Sidorovich_RSQ_quest_7_41241: SIDRewardMap.RSQ07_reward_var2,
  RSQ06_Dialog_Sidorovich_RSQ_quest_8_41242: SIDRewardMap.RSQ08_reward_var3,
  RSQ06_Dialog_Sidorovich_RSQ_special_task_63535: SIDRewardMap.RSQ06_reward_var4,

  RSQ05_Dialog_Sich_RSQ_quest_1_36380: SIDRewardMap.RSQ07_reward_var2,
  RSQ05_Dialog_Sich_RSQ_quest_2_36381: SIDRewardMap.RSQ05_reward_var3,
  RSQ05_Dialog_Sich_RSQ_quest_4_36383: SIDRewardMap.RSQ06_reward_var2,
  RSQ05_Dialog_Sich_RSQ_quest_5_36384: SIDRewardMap.RSQ05_reward_var3,
  RSQ05_Dialog_Sich_RSQ_quest_7_36386: SIDRewardMap.RSQ08_reward_var3,
  RSQ05_Dialog_Sich_RSQ_quest_8_36387: SIDRewardMap.RSQ07_reward_var2,
  RSQ05_Dialog_Sich_RSQ_special_task_63823: SIDRewardMap.RSQ09_reward_var3,
  RSQ05_Dialog_Sich_RSQ_quest_9_36388: SIDRewardMap.RSQ08_reward_var3,

  RSQ04_Dialog_Drabadan_RSQ_quest_1_32932: SIDRewardMap.RSQ04_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_2_32934: SIDRewardMap.RSQ04_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_3_32939: SIDRewardMap.RSQ04_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_4_32945: SIDRewardMap.RSQ07_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_5_32951: SIDRewardMap.RSQ07_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_6_32961: SIDRewardMap.RSQ07_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_7_32965: SIDRewardMap.RSQ07_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_8_32966: SIDRewardMap.RSQ07_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_quest_9_32967: SIDRewardMap.RSQ07_reward_var2,
  RSQ04_Dialog_Drabadan_RSQ_special_task_63727: SIDRewardMap.RSQ06_reward_var2,

  RSQ01_Dialog_Warlock_RSQ_Quest_1_25545: SIDRewardMap.RSQ07_reward_var2,
  RSQ01_Dialog_Warlock_RSQ_Quest_2_25546: SIDRewardMap.RSQ01_reward_var2,
  RSQ01_Dialog_Warlock_RSQ_Quest_3_1stTime_25547: SIDRewardMap.RSQ00_reward_var1,
  RSQ01_Dialog_Warlock_RSQ_Quest_4_25555: SIDRewardMap.RSQ01_reward_var2,
  RSQ01_Dialog_Warlock_RSQ_Quest_5_25557: SIDRewardMap.RSQ01_reward_var2,
  RSQ01_Dialog_Warlock_RSQ_Quest_6_25561: SIDRewardMap.RSQ01_reward_var2,
};

export const rewardFormula = (min: number, max: number) => [Math.round(min * spread[0]), Math.round(max * spread[1])];
