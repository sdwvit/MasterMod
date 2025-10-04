import { DifficultyPrototype } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { transformDynamicItemGenerator } from "./transformDynamicItemGenerator.mjs";
export const DIFFICULTY_FACTOR = 4;
/**
 * Increases cost of everything and damage on Hard difficulty.
 */
export const transformDifficultyPrototypes: EntriesTransformer<DifficultyPrototype> = (struct) => {
  if (struct.SID !== "Hard") {
    return null;
  }
  return Object.assign(struct.fork(), {
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
transformDifficultyPrototypes.files = ["/DifficultyPrototypes.cfg"];
transformDifficultyPrototypes._name = "Increase cost and damage on Hard difficulty";
