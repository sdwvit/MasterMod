import { ArmorPrototype, DynamicItemGenerator, GetStructType, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";
import { allDefaultArmorDefs, allExtraArmors, backfillArmorDef, extraArmorsByFaction, newArmors } from "./armors.util.mjs";
import { factions } from "./factions.mjs";
import { precision } from "./precision.mjs";
import { describe } from "node:test";

const generalTradersTradeItemGenerators = new Set([
  "AsylumTrader_TradeItemGenerator",
  "IkarTrader_TradeItemGenerator",
  "SultanskTrader_TradeItemGenerator",
  "ShevchenkoTrader_TradeItemGenerator",
  "NewbeeVillageTrader_TradeItemGenerator",
  "MalakhitTrader_TradeItemGenerator",
  "CementPlantTrader_TradeItemGenerator",
  "YanovTrader_TradeItemGenerator",
  "PripyatTrader_TradeItemGenerator",
  "RedForestTrader_TradeItemGenerator",
  "EgerTrader_TradeItemGenerator",
  "VartaTrader_TradeItemGenerator",
  "TraderZalesie_TradeItemGenerator",
  "TraderChemicalPlant_TradeItemGenerator",
  "TraderTerikon_TradeItemGenerator",
  "TraderSuska_TradeItemGenerator",
]);

const technicianTradeTradeItemGenerators = new Set([
  "TechnicianChemicalPlant_TradeItemGenerator",
  "PowerPlugTechnician_TradeItemGenerator",
  "AsylumTechnician_TradeItemGenerator",
]);

const transformTrade = (entries: DynamicItemGenerator["entries"]) => {
  Object.values(entries.ItemGenerator.entries)
    .filter((e) => e.entries)
    .forEach((e) => {
      // noinspection FallThroughInSwitchStatementJS
      switch (e.entries?.Category) {
        case "EItemGenerationCategory::Attach":
          if (generalTradersTradeItemGenerators.has(entries.SID)) {
            e.entries = { ReputationThreshold: 1000000 } as unknown as typeof e.entries;
          }
          break;
        case "EItemGenerationCategory::BodyArmor":
        case "EItemGenerationCategory::Head":
        case "EItemGenerationCategory::WeaponPrimary":
        case "EItemGenerationCategory::WeaponPistol":
        case "EItemGenerationCategory::WeaponSecondary":
          e.entries = { ReputationThreshold: 1000000 } as unknown as typeof e.entries;
          break;
        case "EItemGenerationCategory::SubItemGenerator":
          Object.values(e.entries.PossibleItems.entries).forEach((pi) => {
            if (
              generalTradersTradeItemGenerators.has(entries.SID) &&
              (pi.entries?.ItemGeneratorPrototypeSID?.includes("Attach") || pi.entries?.ItemGeneratorPrototypeSID?.includes("Cosnsumables"))
            ) {
              pi.entries.Chance = 0; // Disable attachments sell for general traders
            }
            if (pi.entries?.ItemGeneratorPrototypeSID?.includes("Gun")) {
              pi.entries.Chance = 0; // Disable gun sell
            }
          });
          break;
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
  itemGenerator: DynamicItemGenerator["entries"]["ItemGenerator"]["entries"][number],
  i: number,
) => {
  if (
    entries.SID.includes("WeaponPistol") ||
    entries.SID.includes("Consumables") ||
    entries.SID.includes("Attachments") ||
    entries.SID.includes("Zombie") ||
    entries.SID.includes("No_Armor") ||
    entries.SID.includes("DeadBody")
  ) {
    return;
  }
  const options = Object.values(itemGenerator.entries.PossibleItems.entries).filter(
    (pi) => pi.entries && allArmorAdjustedCost[pi.entries.ItemPrototypeSID],
  );

  const weights = Object.fromEntries(
    options.map((pi) => {
      const key = pi.entries.ItemPrototypeSID;
      return [key, getChanceForSID(key)];
    }),
  );

  const droppableArmors = options.filter((pi) => !adjustButDontDrop.has(pi.entries.ItemPrototypeSID));
  const invisibleArmors = options.filter((pi) => adjustButDontDrop.has(pi.entries.ItemPrototypeSID));

  const faction = entries.SID.split("_").find((f) => factions[f.toLowerCase()]) || "neutral";
  const extraArmors = extraArmorsByFaction[factions[faction.toLowerCase()] as keyof typeof extraArmorsByFaction];
  extraArmors
    .filter((descriptor) =>
      descriptor.PlayerRank && itemGenerator.entries.PlayerRank
        ? descriptor.PlayerRank.split(",").some((r) => itemGenerator.entries.PlayerRank.includes(r))
        : true,
    )
    .forEach((descriptor) => {
      const originalSID = descriptor.refkey;
      const newArmorSID = descriptor.entries.SID as string;
      const dummyPossibleItem = new (Struct.createDynamicClass(newArmorSID))() as GetStructType<PossibleItem>;
      dummyPossibleItem.entries = { ItemPrototypeSID: newArmorSID } as GetStructType<PossibleItem>["entries"];
      weights[newArmorSID] = getChanceForSID(allArmorAdjustedCost[newArmorSID] ? newArmorSID : originalSID);
      const maybeNewArmor = newArmors[newArmorSID];

      if (
        itemGenerator.entries?.Category === (maybeNewArmor?._extras?.ItemGenerator?.Category || "EItemGenerationCategory::BodyArmor") &&
        (itemGenerator.entries.PlayerRank && maybeNewArmor?._extras?.ItemGenerator?.PlayerRank
          ? maybeNewArmor._extras.ItemGenerator.PlayerRank.split(",").some((r) => itemGenerator.entries.PlayerRank.includes(r))
          : true)
      ) {
        let i = 0;
        while (itemGenerator.entries.PossibleItems.entries[i]) {
          i++;
        }
        itemGenerator.entries.PossibleItems.entries[i] = dummyPossibleItem as any;
        if (maybeNewArmor) {
          droppableArmors.push(dummyPossibleItem as any);
        } else {
          invisibleArmors.push(dummyPossibleItem as any);
        }
      }
    });
  const maxAB = Math.max(0, ...droppableArmors.map((pi) => weights[pi.entries.ItemPrototypeSID]));

  const abSum = droppableArmors.reduce((acc, pi) => acc + weights[pi.entries.ItemPrototypeSID], 0);
  const cdSum = invisibleArmors.reduce((acc, pi) => acc + weights[pi.entries.ItemPrototypeSID], 0);

  const x = cdSum ? abSum / maxAB : abSum;
  const y = cdSum / (1 - maxAB);
  droppableArmors.forEach((pi) => {
    pi.entries.Chance = precision(weights[pi.entries.ItemPrototypeSID]);
    pi.entries.Weight = precision(weights[pi.entries.ItemPrototypeSID] / x);
    pi.entries.MinDurability = precision(semiRandom(i) * 0.1 + 0.01);
    pi.entries.MaxDurability = precision(pi.entries.MinDurability + (semiRandom(i) * weights[pi.entries.ItemPrototypeSID]) / 0.15);
  });
  invisibleArmors.forEach((pi) => {
    pi.entries.Chance = 1; // make sure it always spawns on npc
    pi.entries.Weight = precision(weights[pi.entries.ItemPrototypeSID] / y);
  });
  return true;
};
const transformCombat = (entries: DynamicItemGenerator["entries"]) => {
  Object.values(entries.ItemGenerator.entries)
    .filter((e) => e.entries)
    .forEach((itemGenerator, i) => {
      // noinspection FallThroughInSwitchStatementJS
      switch (itemGenerator.entries?.Category) {
        case "EItemGenerationCategory::Head":
          itemGenerator.entries.PlayerRank = "ERank::Veteran, ERank::Master";
        case "EItemGenerationCategory::BodyArmor":
          return transformArmor(entries, itemGenerator as any, i);
        /**
         * Control how many consumables are dropped.
         */
        case "EItemGenerationCategory::Ammo":
        case "EItemGenerationCategory::Artifact":
        case "EItemGenerationCategory::Consumable": {
          return transformConsumables(itemGenerator as any, i);
        }
        case "EItemGenerationCategory::WeaponPrimary":
        case "EItemGenerationCategory::WeaponPistol":
        case "EItemGenerationCategory::WeaponSecondary": {
          return transformWeapons(itemGenerator as any, i);
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
        const SID = e.entries.SID;
        const refkey = e.refkey;
        const dummy = new (Struct.createDynamicClass(SID))() as ArmorPrototype & { entries: { SID: string } };
        dummy.entries = { SID } as any;
        dummy.refkey = refkey;

        return [SID, dummy] as [string, ArmorPrototype & { entries: { SID: string } }];
      }),
    ),
    ...newArmors,
  })
    .filter((armor) => !armor.entries.SID.includes("Template"))
    .map((armor) => {
      const backfilled = backfillArmorDef(JSON.parse(JSON.stringify(armor))) as ArmorPrototype & { entries: { SID: string } };
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
