import { ArmorPrototype, DynamicItemGenerator, Entries, ERank, GetStructType, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";
import { allDefaultArmorDefs, allExtraArmors, backfillArmorDef, extraArmorsByFaction, newArmors } from "./armors.util.mjs";
import { factions } from "./factions.mjs";
import { pseudoRandomBytes } from "node:crypto";

const precision = (e: number) => Math.round(e * 1e3) / 1e3;

const transformTrade = (entries: DynamicItemGenerator["entries"]) => {
  Object.values(entries.ItemGenerator.entries)
    .filter((e) => e.entries)
    .forEach((e) => {
      switch (e.entries?.Category) {
        case "EItemGenerationCategory::BodyArmor":
        case "EItemGenerationCategory::Head":
        case "EItemGenerationCategory::WeaponPrimary":
        case "EItemGenerationCategory::WeaponPistol":
        case "EItemGenerationCategory::WeaponSecondary":
          e.entries = { ReputationThreshold: 1000000 } as unknown as typeof e.entries;
          break;
        case "EItemGenerationCategory::SubItemGenerator":
          Object.values(e.entries.PossibleItems.entries).forEach((pi) => {
            if (pi.entries?.ItemGeneratorPrototypeSID?.includes("Gun")) {
              pi.entries.Chance = 0; // Disable gun sell
            }
          });
          break;
        default:
          (e.entries as Entries) = {};
          break;
      }
    });
};

const createMissingRankGenerators = (entries: DynamicItemGenerator["entries"]) => {
  const faction = entries.SID.split("_").find((f) => factions[f.toLowerCase()]) || "neutral";
  const extraArmors = extraArmorsByFaction[factions[faction.toLowerCase()]];
  // go through each new armor.
  // if there is no suitable item generator, create one suitable
  extraArmors
    .filter(([_, newSID]) => newArmors[newSID])
    .forEach(([_, newSID]) => {
      const hasSuitableGenerator = Object.values(entries.ItemGenerator.entries)
        .filter((e) => e.entries)
        .find((e) => {
          if (!e.entries.PlayerRank) {
            e.entries.PlayerRank = "ERank::Newbie, ERank::Experienced, ERank::Veteran, ERank::Master";
            return true;
          }
          if (!newArmors[newSID]._keysToDelete?.ItemGenerator?.PlayerRank) {
            newArmors[newSID]._keysToDelete ??= {};
            newArmors[newSID]._keysToDelete.ItemGenerator ??= {};
            newArmors[newSID]._keysToDelete.ItemGenerator.PlayerRank = "ERank::Newbie, ERank::Experienced, ERank::Veteran, ERank::Master";
            return true;
          }
          return (
            !!newArmors[newSID]._keysToDelete.ItemGenerator.PlayerRank.split(",").some((r) => e.entries.PlayerRank.includes(r)) &&
            e.entries.Category === newArmors[newSID]._keysToDelete?.ItemGenerator?.Category
          );
        });
      if (!hasSuitableGenerator) {
        const dummyGenerator = new (Struct.createDynamicClass("itemgen"))() as DynamicItemGenerator["entries"]["ItemGenerator"]["entries"][number];
        const possibleItems = new (Struct.createDynamicClass("PossibleItems"))() as GetStructType<PossibleItem[]>;
        possibleItems.entries = {};
        dummyGenerator.entries = {
          Category: newArmors[newSID]._keysToDelete.ItemGenerator.Category,
          PlayerRank: newArmors[newSID]._keysToDelete.ItemGenerator.PlayerRank,
          PossibleItems: possibleItems,
        } as any;
        let i = 0;
        while (entries.ItemGenerator.entries[i]) {
          i++;
        }
        entries.ItemGenerator.entries[i] = dummyGenerator;
      }
    });
};

const transformConsumables = (e: DynamicItemGenerator["entries"]["ItemGenerator"]["entries"][number], i: number) => {
  Object.values(e.entries.PossibleItems.entries)
    .filter((pi) => pi.entries)
    .forEach((pi, j) => {
      pi.entries.Chance = semiRandom(i + j); // Randomize
      while (pi.entries.Chance > 0.02) {
        pi.entries.Chance /= 2;
      }
      pi.entries.Chance = precision(pi.entries.Chance);
    });
};

const transformWeapons = (e: DynamicItemGenerator["entries"]["ItemGenerator"]["entries"][number], i: number) => {
  Object.values(e.entries.PossibleItems.entries)
    .filter((_) => _.entries)
    .forEach((pi, j) => {
      pi.entries.AmmoMinCount = 0;
      pi.entries.AmmoMaxCount = Math.floor(1 + 5 * semiRandom(i + j));
    });
};

/**
 * Allows NPCs to drop armor and helmets.
 */
const transformArmor = (
  entries: DynamicItemGenerator["entries"],
  e: DynamicItemGenerator["entries"]["ItemGenerator"]["entries"][number],
  i: number,
) => {
  const options = Object.values(e.entries.PossibleItems.entries).filter((pi) => pi.entries && allArmorAdjustedCost[pi.entries.ItemPrototypeSID]);

  const weights = Object.fromEntries(
    options.map((pi) => {
      const key = pi.entries.ItemPrototypeSID;
      return [key, getChanceForSID(key)];
    }),
  );

  const ab = options.filter((pi) => !adjustButDontDrop.has(pi.entries.ItemPrototypeSID));
  const cd = options.filter((pi) => adjustButDontDrop.has(pi.entries.ItemPrototypeSID));

  const faction = entries.SID.split("_").find((f) => factions[f.toLowerCase()]) || "neutral";
  const extraArmors = extraArmorsByFaction[factions[faction.toLowerCase()]];
  extraArmors.forEach(([originalSID, newArmorSID]) => {
    const dummyPossibleItem = new (Struct.createDynamicClass(newArmorSID))() as GetStructType<PossibleItem>;
    dummyPossibleItem.entries = { ItemPrototypeSID: newArmorSID } as GetStructType<PossibleItem>["entries"];
    weights[newArmorSID] = getChanceForSID(allArmorAdjustedCost[newArmorSID] ? newArmorSID : originalSID);
    const maybeNewArmor = newArmors[newArmorSID];

    if (
      e.entries?.Category === (maybeNewArmor?._keysToDelete?.ItemGenerator?.Category || "EItemGenerationCategory::BodyArmor") &&
      (e.entries.PlayerRank && maybeNewArmor?._keysToDelete?.ItemGenerator?.PlayerRank
        ? maybeNewArmor._keysToDelete.ItemGenerator.PlayerRank.split(",").some((r) => e.entries.PlayerRank.includes(r))
        : true)
    ) {
      let i = 0;
      while (e.entries.PossibleItems.entries[i]) {
        i++;
      }
      e.entries.PossibleItems.entries[i] = dummyPossibleItem as any;
      if (maybeNewArmor) {
        ab.push(dummyPossibleItem as any);
      } else {
        cd.push(dummyPossibleItem as any);
      }
    }
  });
  const maxAB = Math.max(0, ...ab.map((pi) => weights[pi.entries.ItemPrototypeSID]));

  const abSum = ab.reduce((acc, pi) => acc + weights[pi.entries.ItemPrototypeSID], 0);
  const cdSum = cd.reduce((acc, pi) => acc + weights[pi.entries.ItemPrototypeSID], 0);

  const x = cdSum ? abSum / maxAB : abSum;
  const y = cdSum / (1 - maxAB);
  ab.forEach((pi) => {
    pi.entries.Chance = precision(weights[pi.entries.ItemPrototypeSID]);
    pi.entries.Weight = precision(weights[pi.entries.ItemPrototypeSID] / x);
    pi.entries.MinDurability = precision(semiRandom(i) * 0.1 + 0.01);
    pi.entries.MaxDurability = precision(pi.entries.MinDurability + (semiRandom(i) * weights[pi.entries.ItemPrototypeSID]) / 0.15);
  });
  cd.forEach((pi) => {
    pi.entries.Chance = 1; // make sure it always spawns on npc
    pi.entries.Weight = precision(weights[pi.entries.ItemPrototypeSID] / y);
  });
};
const transformCombat = (entries: DynamicItemGenerator["entries"]) => {
  createMissingRankGenerators(entries);

  Object.values(entries.ItemGenerator.entries)
    .filter((e) => e.entries)
    .forEach((e, i) => {
      switch (e.entries?.Category) {
        case "EItemGenerationCategory::Head":
        case "EItemGenerationCategory::BodyArmor":
          return transformArmor(entries, e as any, i);
        /**
         * Control how many consumables are dropped.
         */
        case "EItemGenerationCategory::Ammo":
        case "EItemGenerationCategory::Artifact":
        case "EItemGenerationCategory::Consumable": {
          return transformConsumables(e as any, i);
        }
        case "EItemGenerationCategory::WeaponPrimary":
        case "EItemGenerationCategory::WeaponPistol":
        case "EItemGenerationCategory::WeaponSecondary": {
          return transformWeapons(e as any, i);
        }
      }
    });
};

/**
 * Does not allow traders to sell gear.
 * Allows NPCs to drop armor.
 */
export const transformDynamicItemGenerator: Meta["entriesTransformer"] = (entries: DynamicItemGenerator["entries"]) => {
  /**
   * Does not allow traders to sell gear.
   */
  if (entries.SID.includes("Trade")) {
    transformTrade(entries);
  } else {
    transformCombat(entries);
  }
  if (Object.values(entries.ItemGenerator.entries).every((e) => Object.keys(e.entries || {}).length === 0)) {
    return null;
  }
  return entries;
};

type PossibleItem = {
  ItemGeneratorPrototypeSID?: string;
  ItemPrototypeSID: string;
  Weight: number;
  MinDurability: number;
  MaxDurability: number;
  Chance: number;
  AmmoMinCount?: number;
  AmmoMaxCount?: number;
};

function calculateArmorScore(armor: ArmorPrototype): number {
  const e = armor.entries;
  const protectionNormalization = { Burn: 100, Shock: 100, ChemicalBurn: 100, Radiation: 100, PSY: 100, Strike: 5, Fall: 100 };
  const protectionScales = { Burn: 5, Shock: 7, ChemicalBurn: 5, Radiation: 10, PSY: 10, Strike: 63, Fall: 1 };
  const protectionScore = Object.keys(protectionScales).reduce((sum, key) => {
    const normalized = (protectionScales[key] * e.Protection.entries[key]) / protectionNormalization[key];
    return sum + normalized / 100;
  }, 0);
  const durabilityScore = ((e.BaseDurability || minDurability) - minDurability) / (maxDurability - minDurability);
  const weightScore = Math.atan(10e10) - Math.atan((e.Weight + 4.31) / 6.73);
  const blockHeadScore = e.bBlockHead ? 1 : 0;
  const speedScore = e.IncreaseSpeedCoef ?? 0; // always 1
  const noiseScore = e.NoiseCoef ?? 0; // always 1
  const slotsScore =
    ((e.ArtifactSlots ?? 0) +
      Object.values(e.UpgradePrototypeSIDs?.entries || {})
        .filter((u) => typeof u === "string")
        .filter((u) => u.toLowerCase().includes("container") || u.toLowerCase().includes("_artifact")).length) /
    10; // 1 to 2
  const preventLimping =
    e.bPreventFromLimping && !Object.values(e.UpgradePrototypeSIDs?.entries || {}).find((u) => typeof u === "string" && u.includes("AddRunEffect"))
      ? 0
      : 1;

  const costScore = Math.atan(10e10) - Math.atan((e.Cost + 27025) / 42000);
  const scoreScales = {
    costScore: 7.5,
    protectionScore: 50,
    durabilityScore: 7.5,
    weightScore: 5,
    slotsScore: 25,
    blockHeadScore: 2.5,
    preventLimping: 2.5,
    speedScore: 0,
    noiseScore: 0,
  };
  const scoreKeys = { costScore, protectionScore, durabilityScore, weightScore, slotsScore, blockHeadScore, preventLimping, speedScore, noiseScore };
  const score = Object.keys(scoreKeys).reduce((sum, e) => sum + scoreKeys[e] * scoreScales[e], 0);
  return score / 100; // 0 to 1
}

const maxDurability = Math.max(...Object.values(allDefaultArmorDefs).map((a) => a.entries.BaseDurability ?? 0));
const minDurability = Math.min(...Object.values(allDefaultArmorDefs).map((a) => a.entries.BaseDurability ?? 10000));

export const allArmorAdjustedCost = Object.fromEntries(
  Object.values({
    ...allDefaultArmorDefs,
    ...Object.fromEntries(
      allExtraArmors.map((e) => {
        const dummy = new (Struct.createDynamicClass(e[1]))() as ArmorPrototype & { entries: { SID: string } };
        dummy.entries = { SID: e[1] } as any;
        dummy.refkey = e[0];

        return [e[1], dummy];
      }),
    ),
    ...newArmors,
  })
    .filter((armor) => !armor.entries.SID.includes("Template"))
    .map((armor) => {
      const backfilled = backfillArmorDef({ ...armor });
      return [armor.entries.SID, calculateArmorScore(backfilled)] as [string, number];
    })
    .sort((a, b) => a[0].localeCompare(b[0])),
);

const minimumArmorCost = Object.values(allArmorAdjustedCost).reduce((a, b) => Math.min(a, b), Infinity);
const maximumArmorCost = Object.values(allArmorAdjustedCost).reduce((a, b) => Math.max(a, b), -Infinity);

const adjustButDontDrop = new Set([
  "NPC_Sel_Armor",
  "NPC_Sel_Neutral_Armor",
  "NPC_Tec_Armor",
  "NPC_Cloak_Heavy_Neutral_Armor",
  "NPC_SkinCloak_Bandit_Armor",
  "NPC_HeavyExoskeleton_Mercenaries_Armor",
  "NPC_Heavy_Military_Armor",
  "NPC_Cloak_Heavy_Military_Armor",
  "NPC_Sci_Armor",
  "NPC_Battle_Noon_Armor",
  "NPC_HeavyAnomaly_Noon_Armor",
  "NPC_HeavyExoskeleton_Noon_Armor",
  "NPC_Exoskeleton_Noon_Armor",
  "NPC_Spark_Armor",
  "NPC_Anomaly_Spark_Armor",
  "NPC_HeavyExoskeleton_Spark_Armor",
  "NPC_Heavy_Corps_Armor",
  "NPC_Heavy2_Coprs_Armor",
  "NPC_Heavy3_Corps_Armor",
  "NPC_Heavy3Exoskeleton_Coprs_Armor",
  "NPC_Exoskeleton_Coprs_Armor",
  "NPC_Richter_Armor",
  "NPC_Korshunov_Armor",
  "NPC_Korshunov_Armor_2",
  "NPC_Dalin_Armor",
  "NPC_Agata_Armor",
  "NPC_Faust_Armor",
  "NPC_Kaymanov_Armor",
  "NPC_Shram_Armor",
  "NPC_Dekhtyarev_Armor",
  "NPC_Sidorovich_Armor",
  "NPC_Barmen_Armor",
  "NPC_Batya_Armor",
  "NPC_Tyotya_Armor",
]);

function getChanceForSID(sid: string) {
  const zeroToOne = 1 - (allArmorAdjustedCost[sid] - minimumArmorCost) / (maximumArmorCost - minimumArmorCost); // 1 means cheapest armor, 0 means most expensive armor
  return zeroToOne * 0.14 + 0.01; // 1% to 15%
}
