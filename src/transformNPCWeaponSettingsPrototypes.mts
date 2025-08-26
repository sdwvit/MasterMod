import { Meta } from "./prepare-configs.mjs";
import { NPCWeaponSettingsPrototype } from "s2cfgtojson";

/**
 * Transforms NPC Weapon Settings Prototypes to set default BaseDamage for Guard NPCs.
 */
export const transformNPCWeaponSettingsPrototypes: Meta["entriesTransformer"] = (
  entries: NPCWeaponSettingsPrototype["entries"],
  { struct, structsById },
) => {
  if (entries.SID.includes("Guard")) {
    entries.BaseDamage = (structsById[struct._refkey]?.entries as Partial<typeof entries>)?.BaseDamage ?? 50;
    return entries;
  }
};
