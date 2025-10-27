import { ItemGeneratorPrototype, Struct } from "s2cfgtojson";
import { semiRandom } from "./semi-random.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";

import { EntriesTransformer, MetaType } from "./metaType.mjs";
import { markAsForkRecursively } from "./markAsForkRecursively.mjs";

export const transformItemGeneratorPrototypes: EntriesTransformer<ItemGeneratorPrototype> = async (struct, context) => {
  if (prohibitedIds.some((id) => struct.SID.includes(id))) {
    return null;
  }
  const ItemGenerator = struct.ItemGenerator?.map(([_k, itemGen], i) => {
    const fork = itemGen.fork();
    const PossibleItems = itemGen.PossibleItems?.map?.(([_k, possibleItem], j) => {
      if (!possibleItem) {
        return;
      }
      const isConsumable = consumablePrototypes.has(possibleItem?.ItemPrototypeSID);
      const isAmmo = ammoPrototypes.has(possibleItem?.ItemPrototypeSID);
      const isGrenade = grenadePrototypes.has(possibleItem?.ItemPrototypeSID);
      if (!isConsumable && !isAmmo && !isGrenade) {
        return;
      }
      let chance = semiRandom(i + j + context.index);
      while (chance > 0.02) {
        chance /= 2;
      }
      const fork = possibleItem.fork();
      fork.Chance = parseFloat(chance.toFixed(4));
      if (possibleItem.MinCount) fork.MinCount = 1;
      if (isConsumable || isGrenade) {
        if (possibleItem.MaxCount) fork.MaxCount = 1;
      }
      if (isAmmo) {
        if (possibleItem.MaxCount) fork.MaxCount = Math.floor(semiRandom(context.index) * 9) + 1;
        if (possibleItem.AmmoMinCount) fork.AmmoMinCount = 1;
        if (possibleItem.AmmoMaxCount) fork.AmmoMaxCount = Math.floor(semiRandom(context.index) * 9) + 1;
      }
      return fork;
    });

    if (PossibleItems?.entries().length) {
      return Object.assign(fork, { PossibleItems });
    }
  });

  if (!ItemGenerator?.entries().length) {
    return;
  }

  return markAsForkRecursively(Object.assign(struct.fork(), { ItemGenerator }));
};
transformItemGeneratorPrototypes.files = ["/ItemGeneratorPrototypes.cfg", "/ItemGeneratorPrototypes/Gamepass_ItemGenerators.cfg"];
transformItemGeneratorPrototypes._name = "Reduce consumable and ammo spawns";
const prohibitedIds = ["Arena"];

const ammoPrototypes = new Set((await readFileAndGetStructs<Struct & { SID: string }>("ItemPrototypes/AmmoPrototypes.cfg")).map((e) => e.SID));
const consumablePrototypes = new Set(
  (await readFileAndGetStructs<Struct & { SID: string }>("ItemPrototypes/ConsumablePrototypes.cfg")).map((e) => e.SID),
);
const grenadePrototypes = new Set((await readFileAndGetStructs<Struct & { SID: string }>("ItemPrototypes/GrenadePrototypes.cfg")).map((e) => e.SID));
