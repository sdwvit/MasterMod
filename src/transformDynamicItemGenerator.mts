import { ArmorPrototype, createDynamicClassInstance, DynamicItemGenerator, ERank, GetStructType, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";
import { allDefaultArmorDefs, allExtraArmors, backfillArmorDef, extraArmorsByFaction, newArmors } from "./armors.util.mjs";
import { factions } from "./factions.mjs";
import { precision } from "./precision.mjs";

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

const minDropProbability = 0.01; // 1%
const maxDropProbability = 0.15; // 15%
const allRanks = new Set<ERank>(["ERank::Newbie", "ERank::Experienced", "ERank::Veteran", "ERank::Master"]);

const transformTrade = (struct: DynamicItemGenerator) => {
  const fork = struct.fork();
  const ItemGenerator = struct.ItemGenerator.map(([_k, e]) => {
    // noinspection FallThroughInSwitchStatementJS
    switch (e.Category) {
      case "EItemGenerationCategory::Attach":
        if (generalTradersTradeItemGenerators.has(struct.SID)) {
          return Object.assign(e.fork(), { ReputationThreshold: 1000000 });
        }
        break;
      case "EItemGenerationCategory::BodyArmor":
      case "EItemGenerationCategory::Head":
      case "EItemGenerationCategory::WeaponPrimary":
      case "EItemGenerationCategory::WeaponPistol":
      case "EItemGenerationCategory::WeaponSecondary":
        return Object.assign(e.fork(), { ReputationThreshold: 1000000 });
      case "EItemGenerationCategory::SubItemGenerator":
        // @ts-expect-error mismatching types
        const PossibleItems = e.PossibleItems.map(([_k, pi]) => {
          if (
            generalTradersTradeItemGenerators.has(struct.SID) &&
            (pi.ItemGeneratorPrototypeSID?.includes("Attach") ||
              pi.ItemGeneratorPrototypeSID?.includes("Cosnsumables") ||
              pi.ItemGeneratorPrototypeSID?.includes("Consumables"))
          ) {
            return Object.assign(pi.fork(), { Chance: 0 }); // Disable attachments and consumables sell for general traders
          }
          if (pi.ItemGeneratorPrototypeSID?.includes("Gun")) {
            return Object.assign(pi.fork(), { Chance: 0 }); // Disable gun sell
          }
        });
        if (!PossibleItems.entries().length) {
          return;
        }
        return Object.assign(e.fork(), { PossibleItems });
    }
  });
  if (!ItemGenerator.entries().length) {
    return;
  }
  return Object.assign(fork, { ItemGenerator });
};

const transformConsumables = (e: DynamicItemGenerator["ItemGenerator"][number], i: number) => {
  const fork = e.fork();
  const PossibleItems = e.PossibleItems.map(([_k, pi], j) => {
    let chance = semiRandom(i + j); // Randomize
    while (chance > 0.02) {
      chance /= 2;
    }
    chance = precision(chance);
    return Object.assign(pi.fork(), { Chance: chance });
  });
  if (!PossibleItems.entries().length) {
    return;
  }
  return Object.assign(fork, { PossibleItems });
};

const transformWeapons = (e: DynamicItemGenerator["ItemGenerator"][number], i: number) => {
  const fork = e.fork();
  const PossibleItems = e.PossibleItems.filter((e): e is any => e[1].AmmoMaxCount > 10).map(([_k, pi], j) =>
    Object.assign(pi.fork(), {
      AmmoMinCount: 0,
      AmmoMaxCount: Math.floor(1 + 5 * semiRandom(i + j)),
    }),
  );
  if (!PossibleItems.entries().length) {
    return;
  }
  return Object.assign(fork, { PossibleItems });
};

/**
 * Allows NPCs to drop armor and helmets.
 */
const transformArmor = (struct: DynamicItemGenerator, itemGenerator: DynamicItemGenerator["ItemGenerator"][number], i: number) => {
  if (
    struct.SID.includes("WeaponPistol") ||
    struct.SID.includes("Consumables") ||
    struct.SID.includes("Attachments") ||
    struct.SID.includes("Zombie") ||
    struct.SID.includes("No_Armor") ||
    struct.SID.includes("DeadBody")
  ) {
    return;
  }
  const fork = itemGenerator.fork();
  fork.bAllowSameCategoryGeneration = true;
  fork.PlayerRank = itemGenerator.PlayerRank;
  fork.Category = itemGenerator.Category;
  fork.PossibleItems = itemGenerator.PossibleItems.filter((e): e is any => !!(e[1] && allArmorRank[e[1].ItemPrototypeSID]));
  const options = fork.PossibleItems.entries().map(([_k, v]) => v);

  const weights = Object.fromEntries(
    options.map((pi) => {
      const key = pi.ItemPrototypeSID;
      return [key, getChanceForSID(key)];
    }),
  );
  const droppableArmors = options.filter((pi) => !undroppableArmors.has(pi.ItemPrototypeSID));
  const invisibleArmors = options.filter((pi) => undroppableArmors.has(pi.ItemPrototypeSID));
  const faction = struct.SID.split("_").find((f) => factions[f.toLowerCase()]) || "neutral";
  const extraArmors = extraArmorsByFaction[factions[faction.toLowerCase()] as keyof typeof extraArmorsByFaction];

  extraArmors
    .filter((descriptor) => {
      const descriptorRank = descriptor.__internal__._extras.ItemGenerator?.PlayerRank;
      const igRank = fork.PlayerRank;

      return descriptorRank && igRank
        ? descriptorRank
            .split(",")
            .map((e) => e.trim())
            .some((r) => igRank.includes(r))
        : true;
    })
    .forEach((descriptor) => {
      const originalSID = descriptor.__internal__.refkey;
      const newArmorSID = descriptor.SID as string;
      const dummyPossibleItem = new Struct({ ItemPrototypeSID: newArmorSID, __internal__: { rawName: "_" } }) as GetStructType<PossibleItem>;

      weights[newArmorSID] = getChanceForSID(allArmorRank[newArmorSID] ? newArmorSID : originalSID);
      const maybeNewArmor = newArmors[newArmorSID] as typeof descriptor;

      if (fork.Category === (maybeNewArmor?.__internal__._extras?.ItemGenerator?.Category || "EItemGenerationCategory::BodyArmor")) {
        fork.PossibleItems.addNode(dummyPossibleItem, newArmorSID);
        if (maybeNewArmor || descriptor.__internal__._extras.isDroppable) {
          droppableArmors.push(dummyPossibleItem as any);
        } else {
          invisibleArmors.push(dummyPossibleItem as any);
        }
      }
    });
  const maxAB = Math.max(0, ...droppableArmors.map((pi) => weights[pi.ItemPrototypeSID]));

  const abSum = droppableArmors.reduce((acc, pi) => acc + weights[pi.ItemPrototypeSID], 0);
  const cdSum = invisibleArmors.reduce((acc, pi) => acc + weights[pi.ItemPrototypeSID], 0);

  const x = cdSum ? abSum / maxAB : abSum;
  const y = cdSum / (1 - maxAB);
  droppableArmors.forEach((pi) => {
    pi.Chance = 1;
    pi.Weight = precision(weights[pi.ItemPrototypeSID] / x);
    pi.MinDurability = precision(semiRandom(i) * 0.1 + minDropProbability);
    pi.MaxDurability = precision(pi.MinDurability + (semiRandom(i) * weights[pi.ItemPrototypeSID]) / maxDropProbability);
  });
  invisibleArmors.forEach((pi) => {
    pi.Chance = 1; // make sure it always spawns on npc
    pi.Weight = precision(weights[pi.ItemPrototypeSID] / y);
  });
  fork.PossibleItems = fork.PossibleItems.filter((e): e is any => !!(e[1] && allArmorRank[e[1].ItemPrototypeSID]));
  if (!fork.PossibleItems.entries().length) {
    return;
  }

  return fork;
};

const transformCombat = (struct: DynamicItemGenerator) => {
  const fork = struct.fork();

  const categories = struct.ItemGenerator.entries().map(([_k, ig]) => ig.Category);
  categories.forEach((Category) => {
    const generators = struct.ItemGenerator.entries().filter(([_k, ig]) => ig.Category === Category);
    const genRanks = new Set(generators.flatMap(([_k, ig]) => (ig.PlayerRank ? ig.PlayerRank.split(",").map((r) => r.trim()) : [])));
    const missingRanks = allRanks.difference(genRanks);
    if (generators.length) {
      [...missingRanks].forEach((mr) => {
        struct.ItemGenerator.addNode(
          new Struct({
            Category,
            PlayerRank: mr,
            bAllowSameCategoryGeneration: true,
            PossibleItems: new Struct({
              __internal__: { rawName: "PossibleItems", isArray: true },
            }),
          }),
          `${Category.replace("EItemGenerationCategory::", "")}_for_${mr.replace("ERank::", "_")}`,
        );
      });
    }
  });

  const ItemGenerator = struct.ItemGenerator.map(([_k, itemGenerator], i) => {
    // noinspection FallThroughInSwitchStatementJS
    switch (itemGenerator.Category) {
      case "EItemGenerationCategory::Head":
      case "EItemGenerationCategory::BodyArmor":
        return transformArmor(struct, itemGenerator as any, i);
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

  if (!ItemGenerator.entries().length || !ItemGenerator.filter((e): e is any => !!(e[1].PossibleItems as Struct).entries().length).entries().length) {
    return;
  }

  return Object.assign(fork, { ItemGenerator });
};

/**
 * Does not allow traders to sell gear.
 * Allows NPCs to drop armor.
 */
export const transformDynamicItemGenerator: Meta<DynamicItemGenerator>["entriesTransformer"] = (struct) => {
  /**
   * Does not allow traders to sell gear.
   */
  if (struct.SID.includes("Trade")) {
    return transformTrade(struct);
  }
  return transformCombat(struct);
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
  const e = armor;
  const protectionNormalization = { Burn: 100, Shock: 100, ChemicalBurn: 100, Radiation: 100, PSY: 100, Strike: 5, Fall: 100 };
  const protectionScales = { Burn: 5, Shock: 7, ChemicalBurn: 5, Radiation: 10, PSY: 10, Strike: 63, Fall: 1 };
  const protectionScore = Object.keys(protectionScales).reduce((sum, key) => {
    const normalized = (protectionScales[key] * e.Protection[key]) / protectionNormalization[key];
    return sum + normalized / 100;
  }, 0);
  const durabilityScore = ((e.BaseDurability || minDurability) - minDurability) / (maxDurability - minDurability);
  const weightScore = Math.atan(10e10) - Math.atan((e.Weight + 4.31) / 6.73);
  const blockHeadScore = e.bBlockHead ? 1 : 0;
  const speedScore = e.IncreaseSpeedCoef ?? 0; // always 1
  const noiseScore = e.NoiseCoef ?? 0; // always 1
  const slotsScore =
    ((e.ArtifactSlots ?? 0) +
      Object.values(e.UpgradePrototypeSIDs || {})
        .filter((u) => typeof u === "string")
        .filter((u) => u.toLowerCase().includes("container") || u.toLowerCase().includes("_artifact")).length) /
    10; // 1 to 2
  const preventLimping =
    e.bPreventFromLimping && !Object.values(e.UpgradePrototypeSIDs || {}).find((u) => typeof u === "string" && u.includes("AddRunEffect")) ? 0 : 1;

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

const maxDurability = Math.max(...Object.values(allDefaultArmorDefs).map((a) => a.BaseDurability ?? 0));
const minDurability = Math.min(...Object.values(allDefaultArmorDefs).map((a) => a.BaseDurability ?? 10000));

export const allArmorRank = Object.fromEntries(
  Object.values({
    ...allDefaultArmorDefs,
    ...Object.fromEntries(
      allExtraArmors.map((e) => {
        const SID = e.SID;
        const refkey = e.__internal__.refkey;
        const dummy = createDynamicClassInstance(SID) as ArmorPrototype;
        dummy.SID = SID;
        dummy.__internal__.refkey = refkey;

        return [SID, dummy] as [string, ArmorPrototype];
      }),
    ),
    ...newArmors,
  })
    .filter((armor) => !armor.SID.includes("Template"))
    .map((armor) => {
      const backfilled = backfillArmorDef(JSON.parse(JSON.stringify(armor))) as ArmorPrototype;
      return [armor.SID, calculateArmorScore(backfilled)] as [string, number];
    })
    .sort((a, b) => a[0].localeCompare(b[0])),
);

const minimumArmorCost = Object.values(allArmorRank).reduce((a, b) => Math.min(a, b), Infinity);
const maximumArmorCost = Object.values(allArmorRank).reduce((a, b) => Math.max(a, b), -Infinity);

const undroppableArmors = new Set([
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
  const zeroToOne = 1 - (allArmorRank[sid] - minimumArmorCost) / (maximumArmorCost - minimumArmorCost); // 1 means cheapest armor, 0 means most expensive armor
  return zeroToOne * 0.14 + 0.01; // 1% to 15%
}
