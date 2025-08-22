export const extraArmorsByFaction = {
  spark: {
    HeavyBattle_Spark_Armor: "MasterMod_NPC_HeavyBattle_Spark_Armor",
    // Battle_Spark_Armor: "MasterMod_NPC_Battle_Spark_Armor",
    //HeavyAnomaly_Spark_Armor: "MasterMod_NPC_HeavyAnomaly_Spark_Armor",
    // SEVA_Spark_Armor: "MasterMod_NPC_SEVA_Spark_Armor",
    //   NPC_HeavyExoskeleton_Spark_Armor: "MasterMod_NPC_NPC_HeavyExoskeleton_Spark_Armor",
  },
  neutral: {},
  bandit: {},
  mercenary: {},
  military: {},
  corpus: {},
  scientist: {},
  freedom: {},
  duty: {},
  monolith: {},
  varta: {},
};

const extraNpcArmors = {
  ...extraArmorsByFaction.spark,
};
export const extraArmors = Object.entries(extraNpcArmors);
