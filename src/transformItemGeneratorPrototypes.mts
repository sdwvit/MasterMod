import { EItemGenerationCategory, EUISound, GetStructType } from "s2cfgtojson";
import { Meta, WithSID } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
type ItemGeneratorType = GetStructType<{
  SID: string;
  SpecificRewardSound: EUISound;
  ItemGenerator: {
    Category: EItemGenerationCategory;
    PossibleItems: {
      ItemPrototypeSID: string;
      ItemGeneratorPrototypeSID: string;
      Weight: number;
      Chance: number;
      MinDurability: number;
      MaxDurability: number;
      MinCount: number;
      MaxCount: number;
      AmmoMinCount: number;
      AmmoMaxCount: number;
      bRequireWeapon: boolean;
    }[];
  }[];
}>;

export const transformItemGeneratorPrototypes: Meta["entriesTransformer"] = (entries: ItemGeneratorType["entries"], { filePath, index }) => {
  if (!filePath.includes("/ItemGeneratorPrototypes.cfg") && !filePath.includes("/ItemGeneratorPrototypes/Gamepass_ItemGenerators.cfg")) {
    return entries;
  }

  let keep = false;

  if (prohibitedIds.some((id) => entries.SID.includes(id))) {
    return null;
  }

  Object.values(entries.ItemGenerator?.entries || {}).forEach((itemGen) => {
    Object.values(itemGen.entries?.PossibleItems?.entries || {}).forEach((possibleItem) => {
      if (!possibleItem.entries) {
        return;
      }
      const isConsumable = consumablePrototypes.has(possibleItem.entries?.ItemPrototypeSID);
      const isAmmo = ammoPrototypes.has(possibleItem.entries?.ItemPrototypeSID);
      const isGrenade = grenadePrototypes.has(possibleItem.entries?.ItemPrototypeSID);
      if (!isConsumable && !isAmmo && !isGrenade) {
        return;
      }
      keep = true;
      let chance = possibleItem.entries.Chance || 1;
      while (chance > 0.2) {
        chance /= Math.floor(semiRandom(index) * 8) + 2;
      }
      if (possibleItem.entries.MinCount) possibleItem.entries.MinCount = 1;
      possibleItem.entries.Chance = parseFloat(chance.toFixed(3));
      if (isConsumable || isGrenade) {
        if (possibleItem.entries.MaxCount) possibleItem.entries.MaxCount = 1;
      }
      if (isAmmo) {
        if (possibleItem.entries.MaxCount) possibleItem.entries.MaxCount = Math.floor(semiRandom(index) * 9) + 1;
        if (possibleItem.entries.AmmoMinCount) possibleItem.entries.AmmoMinCount = 1;
        if (possibleItem.entries.AmmoMaxCount) possibleItem.entries.AmmoMaxCount = Math.floor(semiRandom(index) * 9) + 1;
      }
    });
  });

  return keep ? entries : null;
};

const prohibitedIds = ["Arena"];

const ammoPrototypes = new Set(readFileAndGetStructs<WithSID>("ItemPrototypes/AmmoPrototypes.cfg").map((e) => e.entries.SID));
const consumablePrototypes = new Set(readFileAndGetStructs<WithSID>("ItemPrototypes/ConsumablePrototypes.cfg").map((e) => e.entries.SID));
const grenadePrototypes = new Set(readFileAndGetStructs<WithSID>("ItemPrototypes/GrenadePrototypes.cfg").map((e) => e.entries.SID));
