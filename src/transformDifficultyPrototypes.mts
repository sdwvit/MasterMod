import { DifficultyPrototype, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
export const DIFFICULTY_FACTOR = 4;
/**
 * Increases cost of everything and damage on Hard difficulty.
 */
export const transformDifficultyPrototypes: Meta<DifficultyPrototype>["entriesTransformer"] = ({ SID }) => {
  if (SID !== "Hard") {
    return null;
  }
  return new Struct({
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
  } as DifficultyPrototype);
};
