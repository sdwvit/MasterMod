export const extraArmorsByFaction = {
  spark: {
    HeavyBattle_Spark_Armor: "MasterMod_NPC_HeavyBattle_Spark_Armor",
    Battle_Spark_Armor: "MasterMod_NPC_Battle_Spark_Armor",
    HeavyAnomaly_Spark_Armor: "MasterMod_NPC_HeavyAnomaly_Spark_Armor",
    SEVA_Spark_Armor: "MasterMod_NPC_SEVA_Spark_Armor",
    NPC_HeavyExoskeleton_Spark_Armor: "MasterMod_NPC_NPC_HeavyExoskeleton_Spark_Armor",
  },
  neutral: {
    Jemmy_Neutral_Armor: "MasterMod_NPC_Jemmy_Neutral_Armor",
    Newbee_Neutral_Armor: "MasterMod_NPC_Newbee_Neutral_Armor",
    Nasos_Neutral_Armor: "MasterMod_NPC_Nasos_Neutral_Armor",
    Zorya_Neutral_Armor: "MasterMod_NPC_Zorya_Neutral_Armor",
    SEVA_Neutral_Armor: "MasterMod_NPC_SEVA_Neutral_Armor",
    Seva_Neutral_Armor: "MasterMod_NPC_Seva_Neutral_Armor",
    Exoskeleton_Neutral_Armor: "MasterMod_NPC_Exoskeleton_Neutral_Armor",
    Exosekeleton_Neutral_Armor: "MasterMod_NPC_Exosekeleton_Neutral_Armor",
    NPC_Sel_Neutral_Armor: "MasterMod_NPC_NPC_Sel_Neutral_Armor",
    NPC_Cloak_Heavy_Neutral_Armor: "MasterMod_NPC_NPC_Cloak_Heavy_Neutral_Armor",
    Light_Neutral_Helmet: "MasterMod_NPC_Light_Neutral_Helmet",
  },
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
