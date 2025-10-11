import { QuestItemPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

/**
 * Remove an essential flag from various items
 */
export const transformWeaponPrototypes: EntriesTransformer<QuestItemPrototype> = (struct) => {
  if (struct.IsQuestItem) {
    return Object.assign(struct.fork(), { IsQuestItem: false });
  }
  return null;
};
transformWeaponPrototypes.files = ["/WeaponPrototypes.cfg"];
transformWeaponPrototypes._name = "Remove an essential flag from WeaponPrototypes";
