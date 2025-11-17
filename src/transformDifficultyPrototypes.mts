import { DifficultyPrototype } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
export const DIFFICULTY_FACTOR = 4;
/**
 * Increases cost of everything and damage on Hard and Stalker difficulty.
 */
export const transformDifficultyPrototypes: EntriesTransformer<DifficultyPrototype> = async (struct) => {
  if (struct.SID !== "Hard" && struct.SID !== "Stalker") {
    return null;
  }
  const fork = Object.assign(struct.fork(), {
    Ammo_Cost: DIFFICULTY_FACTOR,
    Repair_Cost: DIFFICULTY_FACTOR,
    Upgrade_Cost: DIFFICULTY_FACTOR,
    Consumable_Cost: DIFFICULTY_FACTOR,
    Armor_Cost: DIFFICULTY_FACTOR,
    Weapon_Cost: DIFFICULTY_FACTOR,
    Artifact_Cost: DIFFICULTY_FACTOR,

    Weapon_BaseDamage: DIFFICULTY_FACTOR,
    NPC_Weapon_BaseDamage: DIFFICULTY_FACTOR,
    Mutant_BaseDamage: DIFFICULTY_FACTOR,

    Reward_MainLine_Money: DIFFICULTY_FACTOR,
    //    Reward_SideLine_Money: DIFFICULTY_FACTOR,
  } as DifficultyPrototype);
  fork.removeNode("AllowedSaveTypes");
  fork.removeNode("TotalSaveLimits");
  fork.bShouldDisableCompass = false;
  fork.BlockSettings = false;
  return fork;
};
transformDifficultyPrototypes.files = ["/DifficultyPrototypes.cfg"];
