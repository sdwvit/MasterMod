import { BarbedWirePrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

/**
 * Remove barbed wire bleeding and armor damage
 */
export const transformBarbedWirePrototypes: EntriesTransformer<BarbedWirePrototype> = (struct) => {
  const fork = struct.fork();

  if (struct.BleedingChance) fork.BleedingChance = 0;
  if (struct.BleedingValue) fork.BleedingValue = 0;
  if (struct.ArmorDamage) fork.ArmorDamage = 0;

  return fork;
};

transformBarbedWirePrototypes.files = ["/BarbedWirePrototypes.cfg"];
transformBarbedWirePrototypes._name = "Remove barbed wire bleeding and armor damage";
