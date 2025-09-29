import { ItemGeneratorPrototype, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";

export const transformItemGeneratorPrototypes: Meta<ItemGeneratorPrototype>["entriesTransformer"] = (struct, context) => {
  let keep = false;

  if (prohibitedIds.some((id) => struct.SID.includes(id))) {
    return null;
  }
  const ig = struct.ItemGenerator || {};
  Object.values<ItemGeneratorPrototype["ItemGenerator"][number]>(ig).forEach((itemGen, i) => {
    Object.values<(typeof itemGen.PossibleItems)[number]>((itemGen?.PossibleItems || {}) as any).forEach((possibleItem, j) => {
      if (!possibleItem) {
        return;
      }
      const isConsumable = consumablePrototypes.has(possibleItem?.ItemPrototypeSID);
      const isAmmo = ammoPrototypes.has(possibleItem?.ItemPrototypeSID);
      const isGrenade = grenadePrototypes.has(possibleItem?.ItemPrototypeSID);
      if (!isConsumable && !isAmmo && !isGrenade) {
        return;
      }
      keep = true;
      let chance = semiRandom(i + j + context.index);
      while (chance > 0.02) {
        chance /= 2;
      }
      possibleItem.Chance = parseFloat(chance.toFixed(4));
      if (possibleItem.MinCount) possibleItem.MinCount = 1;
      if (isConsumable || isGrenade) {
        if (possibleItem.MaxCount) possibleItem.MaxCount = 1;
      }
      if (isAmmo) {
        if (possibleItem.MaxCount) possibleItem.MaxCount = Math.floor(semiRandom(context.index) * 9) + 1;
        if (possibleItem.AmmoMinCount) possibleItem.AmmoMinCount = 1;
        if (possibleItem.AmmoMaxCount) possibleItem.AmmoMaxCount = Math.floor(semiRandom(context.index) * 9) + 1;
      }
    });
  });

  return keep ? struct : null;
};

const prohibitedIds = ["Arena"];

const ammoPrototypes = new Set(readFileAndGetStructs<Struct & { SID: string }>("ItemPrototypes/AmmoPrototypes.cfg").map((e) => e.SID));
const consumablePrototypes = new Set(readFileAndGetStructs<Struct & { SID: string }>("ItemPrototypes/ConsumablePrototypes.cfg").map((e) => e.SID));
const grenadePrototypes = new Set(readFileAndGetStructs<Struct & { SID: string }>("ItemPrototypes/GrenadePrototypes.cfg").map((e) => e.SID));
