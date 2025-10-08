import { Struct, TradePrototype } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";
import { semiRandom } from "./semi-random.mjs";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";
import { precision } from "./precision.mjs";

const oncePerFile = new Set<string>();
/**
 * Don't allow traders to buy weapons and armor.
 */
export const transformTradePrototypes: EntriesTransformer<TradePrototype> = (struct, context) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(
      new Struct({
        __internal__: {
          rawName: "Guide_TradePrototype",
          refkey: "[0]",
          isRoot: true,
        },
        SID: "Guide_TradePrototype",
        TradeTimeLength: 24,
        TradeGenerators: {
          __internal__: { isArray: true },
          0: {
            ConditionSID: "ConstTrue",
            ItemGeneratorPrototypeSID: "empty",
            BuyModifier: 10,
            SellModifier: 10,
            BuyLimitations: {
              __internal__: { isArray: true },
              0: "EItemType::Weapon",
              1: "EItemType::Armor",
              2: "EItemType::Artifact",
              3: "EItemType::Attach",
              4: "EItemType::Consumable",
              5: "EItemType::Detector",
              6: "EItemType::Grenade",
              7: "EItemType::MutantLoot",
              8: "EItemType::Ammo",
            },
          },
        },
        BuyDiscounts: {
          __internal__: { isArray: true },
          0: {
            ConditionSID: "PlayerRankExperienced",
            Modifier: 1.15,
          },
          1: {
            ConditionSID: "PlayerRankVeteran",
            Modifier: 1.2,
          },
          2: {
            ConditionSID: "PlayerRankMaster",
            Modifier: 1.25,
          },
        },
        bInfiniteMoney: true,
        RefreshConditionSID: "TradeRegenHoursPassed8",
      }) as TradePrototype,
    );
  }

  if (!struct.TradeGenerators) {
    return;
  }
  const fork = struct.fork();
  if (GeneralNPCTradePrototypesMoneyMult.has(struct.SID)) {
    fork.Money = precision(
      GeneralNPCTradePrototypesMoneyMult.get(struct.SID) * DIFFICULTY_FACTOR * (struct.Money ?? 1000) * (semiRandom(context.index) + 1),
      1,
    );
  }
  const TradeGenerators = struct.TradeGenerators.map(([_k, tg]) => {
    const fork = tg.fork();
    fork.BuyLimitations = tg.BuyLimitations?.fork?.() || (new Struct({ __internal__: { isArray: true, bpatch: true } }) as any);

    const limitations = ["EItemType::MutantLoot"];

    if (bartenders.has(struct.SID)) {
      limitations.push(
        ...[
          "EItemType::Armor",
          "EItemType::Artifact",
          "EItemType::Weapon",
          "EItemType::Ammo",
          "EItemType::Attach",
          "EItemType::Detector",
          "EItemType::Grenade",
          "EItemType::MutantLoot",
        ],
      );
    }

    if (medics.has(struct.SID)) {
      fork.BuyModifier = 0.7;
      limitations.push(
        ...[
          "EItemType::Armor",
          "EItemType::Artifact",
          "EItemType::Weapon",
          "EItemType::Ammo",
          "EItemType::Attach",
          "EItemType::Detector",
          "EItemType::Grenade",
          "EItemType::Other",
        ],
      );
    }

    if (generalTraders.has(struct.SID)) {
      limitations.push(
        ...[
          "EItemType::Armor",
          "EItemType::Consumable",
          "EItemType::Weapon",
          "EItemType::Ammo",
          "EItemType::Detector",
          "EItemType::Grenade",
          "EItemType::Other",
          "EItemType::Attach",
        ],
      );
    }

    if (technicianTradePrototypeSIDs.has(struct.SID)) {
      limitations.push(
        ...["EItemType::Artifact", "EItemType::Armor", "EItemType::Weapon", "EItemType::Ammo", "EItemType::Consumable", "EItemType::Other"],
      );
    }
    while (limitations.length < allBuyLimitations.size) {
      limitations.push("delete");
    }
    limitations.forEach((l, i) => (l === "delete" ? fork.BuyLimitations.removeNode(`${i}`) : fork.BuyLimitations.addNode(l)));

    if (GeneralNPCTradePrototypesMoneyMult.has(struct.SID)) {
      fork.ArmorSellMinDurability = 1;
      fork.WeaponSellMinDurability = 1;
    }
    if (tg.BuyModifier !== 0.3) {
      fork.BuyModifier = 0.3;
    }
    return fork;
  });

  return Object.assign(fork, { TradeGenerators });
};

transformTradePrototypes._name = "Restrict trader buy limitations";
transformTradePrototypes.files = ["/TradePrototypes.cfg"];

const allBuyLimitations = new Set([
  "EItemType::Ammo",
  "EItemType::Armor",
  "EItemType::Artifact",
  "EItemType::Attach",
  "EItemType::Consumable",
  "EItemType::Detector",
  "EItemType::Grenade",
  "EItemType::MutantLoot",
  "EItemType::Other",
  "EItemType::Weapon",
]);

const bartenders = new Set([
  "Bartender_Zalesie_TradePrototype",
  "Bartender_ChemicalPlant_TradePrototype",
  "Bartender_Terricon_TradePrototype",
  "Bartender_Sultansk_TradePrototype",
  "BartenderBanditSultansk_TradePrototype",
  "Bartender_Shevchenko_TradePrototype",
  "Bartender_Malakhit_TradePrototype",
  "Bartender_CementPlant_TradePrototype",
  "Bartender_Rostok_TradePrototype",
  "Bartender_RostokArena_TradePrototype",
  "Bartender_Yanov_TradePrototype",
]);

const medics = new Set([
  "Medic_Zalesie_TradePrototype",
  "Medic_ChemicalPlant_TradePrototype",
  "Medic_Terricon_TradePrototype",
  "Asylum_Medic_TradePrototype",
  "Ikar_Medic_TradePrototype",
  "Sultansk_Medic_TradePrototype",
  "NewbieVillage_Medic_TradePrototype",
  "Malakhit_Medic_TradePrototype",
  "CementPlant_Medic_TradePrototype",
  "Rostok_Medic_TradePrototype",
  "Yanov_Medic_TradePrototype",
]);

export const technicianTradePrototypeSIDs = new Set([
  "Asylum_Technician_TradePrototype",
  "Ikar_Technician_TradePrototype",
  "Backwater_Technician_TradePrototype",
  "ZalesieTechnician_TradePrototype",
  "TerriconTechnician_TradePrototype",
  "PowerPlugTechnician_TradePrototype",
  "VartaTechnician_TradePrototype",
  "Technician_NewbieVillage_TradePrototype",
  "Technician_Malakhit_TradePrototype",
  "Technician_ChemicalPlant_TradePrototype",
  "TechnicianChemicalPlant_TradeItemGenerator",
  "AsylumTechnician_TradeItemGenerator",
  "BackwaterTechnician_TradeItemGenerator",
  "Technician_Sultansk_TradePrototype",
  "SultanskTechnician_TradeItemGenerator",
  "NewbeeVillageTechnician_TradeItemGenerator",
  "Technician_CementPlant_TradePrototype",
  "Technician_Rostok_TradePrototype",
  "RostokTechnician_TradeItemGenerator",
  "Technician_Yanov_TradePrototype",
  "YanovTechnician_TradeItemGenerator",
  "Technician_Pripyat_TradePrototype",
  "PripyatTechnician_TradeItemGenerator",
  "ZalesieTechnician_TradeItemGenerator",
  "TerriconTechnician_TradeItemGenerator",
  "PowerPlugTechnician_TradeItemGenerator",
  "VartaTechnician_TradeItemGenerator",
]);

export const generalTraders = new Set([
  "BaseTraderNPC_Template",
  "BasicTrader",
  "TraderNPC",
  "AllTraderNPC",
  "RC_TraderNPC",
  "Trader_Zalesie_TradePrototype",
  "Trader_ChemicalPlant_TradePrototype",
  "Trader_Terikon_TradePrototype",
  "Asylum_Trader_TradePrototype",
  "Trader_Ikar_TradePrototype",
  "Trader_Sultansk_TradePrototype",
  "Trader_Shevchenko_TradePrototype",
  "Trader_NewbeeVillage_TradePrototype",
  "Trader_Malakhit_TradePrototype",
  "Trader_CementPlant_TradePrototype",
  "Trader_Armor_Rostok_TradePrototype",
  "Trader_NATO_Rostok_TradePrototype",
  "Trader_Soviet_Rostok_TradePrototype",
  "Trader_Yanov_TradePrototype",
  "Trader_Pripyat_TradePrototype",
  "Trader_RedForest_TradePrototype",
  "EgerTrader_TradePrototype",
  "TraderSuska_TradePrototype",
  "VartaTrader_TradePrototype",
]);

export const GeneralNPCTradePrototypesMoneyMult = new Map([
  ["GeneralNPC_TradePrototype_Bandit", 0.8],
  ["GeneralNPC_TradePrototype", 1],
  ["GeneralNPC_TradePrototype_Militaries", 1.1],
  ["GeneralNPC_TradePrototype_Scientists", 1.4],
  ["GeneralNPC_TradePrototype_Duty", 1.8],
  ["GeneralNPC_TradePrototype_Mercenary", 2.1],
  ["GeneralNPC_TradePrototype_Freedom", 2.5],
  ["GeneralNPC_TradePrototype_Spark", 3],
  ["GeneralNPC_TradePrototype_Corpus", 5],
]);
