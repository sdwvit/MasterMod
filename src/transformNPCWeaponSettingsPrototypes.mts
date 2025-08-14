import { Meta } from "./prepare-configs.mjs";
import { GetStructType } from "s2cfgtojson";

/**
 * Transforms NPC Weapon Settings Prototypes to set default BaseDamage for Guard NPCs.
 */
export const transformNPCWeaponSettingsPrototypes: Meta["entriesTransformer"] = (entries: NPCWSPrototype["entries"], { struct, structsById }) => {
  if (entries.SID.includes("Guard")) {
    entries.BaseDamage = (structsById[struct._refkey]?.entries as Partial<typeof entries>)?.BaseDamage ?? 50;
    return entries;
  }
};

type NPCWSPrototype = GetStructType<{ SID: string; BaseDamage: number }>;
