import { Meta } from "./prepare-configs.mjs";

/**
 * Increases cost of everything and damage on Hard difficulty.
 */
export const transformDifficultyPrototypes: Meta["entriesTransformer"] = (_) => {
  if (_.SID !== "Hard") {
    return null;
  }
  return {
    Ammo_Cost: 4.0,
    Repair_Cost: 2.0,
    Upgrade_Cost: 4.0,
    Consumable_Cost: 4.0,
    Armor_Cost: 4.0,
    Weapon_Cost: 4.0,
    Artifact_Cost: 4.0,

    Weapon_BaseDamage: 4,
    NPC_Weapon_BaseDamage: 4,
    Mutant_BaseDamage: 4,
  };
};
