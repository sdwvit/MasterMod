import { WeaponPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

/**
 * Remove an essential flag from various items
 */
export const transformWeaponPrototypes: EntriesTransformer<WeaponPrototype> = async (struct) => {
  const fork = struct.fork();
  if (struct.IsQuestItem) {
    Object.assign(fork, { IsQuestItem: false });
  }
  if (!fork.entries().length) {
    return null;
  }
  return fork;
};
transformWeaponPrototypes.files = ["/WeaponPrototypes.cfg"];
