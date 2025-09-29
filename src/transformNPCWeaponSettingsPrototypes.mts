import { Meta } from "./prepare-configs.mjs";
import { NPCWeaponSettingsPrototype } from "s2cfgtojson";

/**
 * Transforms NPC Weapon Settings Prototypes to set default BaseDamage for Guard NPCs.
 */
export const transformNPCWeaponSettingsPrototypes: Meta<NPCWeaponSettingsPrototype>["entriesTransformer"] = (struct, { structsById }) => {
  if (struct.SID.includes("Guard")) {
    struct.BaseDamage = (structsById[struct.__internal__.refkey] as Partial<typeof struct>)?.BaseDamage ?? 50;
    return struct;
  }
  if (struct.SID === "GunAK74_Strelok_ST_NPC") {
    struct.BaseDamage = 9;
    struct.ArmorPiercing = 3;
    return struct;
  }
};
