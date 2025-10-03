import { Meta } from "./prepare-configs.mjs";
import { NPCWeaponSettingsPrototype } from "s2cfgtojson";

/**
 * Transforms NPC Weapon Settings Prototypes to set default BaseDamage for Guard NPCs.
 */
export const transformNPCWeaponSettingsPrototypes: Meta<NPCWeaponSettingsPrototype>["entriesTransformer"] = (struct, { structsById }) => {
  if (struct.SID.includes("Guard")) {
    let ref = structsById[struct.__internal__.refkey];

    while (ref?.BaseDamage >= 500) {
      ref = structsById[ref.__internal__.refkey];
    }

    return Object.assign(struct.fork(), { BaseDamage: ref?.BaseDamage ?? 50 });
  }
  if (struct.SID === "GunAK74_Strelok_ST_NPC") {
    return Object.assign(struct.fork(), { BaseDamage: 9, ArmorPiercing: 3 });
  }
};
