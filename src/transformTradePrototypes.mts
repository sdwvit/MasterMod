import { Struct, TradePrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Don't allow traders to buy weapons and armor.
 */
export const transformTradePrototypes: Meta<TradePrototype>["entriesTransformer"] = (struct) => {
  if (!struct.TradeGenerators) {
    return;
  } else {
    return Object.assign(struct.fork(), {
      TradeGenerators: struct.TradeGenerators.map(([_k, tg]) => {
        const limitations = ["EItemType::Weapon", "EItemType::Armor", "EItemType::Ammo", "EItemType::MutantLoot"];

        if (bartenders.has(struct.SID)) {
          limitations.push(...["EItemType::Artifact", "EItemType::Attach", "EItemType::Detector", "EItemType::Grenade", "EItemType::MutantLoot"]);
        }

        if (medics.has(struct.SID)) {
          limitations.push(...["EItemType::Artifact", "EItemType::Attach", "EItemType::Detector", "EItemType::Grenade", "EItemType::Other"]);
        }

        if (generalTraders.has(struct.SID)) {
          limitations.push(...["EItemType::Consumable", "EItemType::Detector", "EItemType::Grenade", "EItemType::Other", "EItemType::Attach"]);
        }

        if (technicianTradePrototypeSIDs.has(struct.SID)) {
          limitations.push(...["EItemType::Artifact", "EItemType::Consumable", "EItemType::Other"]);
        }
        const fork = tg.fork();
        if (!tg.BuyLimitations) {
          tg.BuyLimitations = new Struct({ __internal__: { isArray: true } }) as any;
        }
        fork.BuyLimitations = Object.assign(tg.BuyLimitations.fork(), {
          0: "EItemType::Weapon",
          1: "EItemType::Armor",
        });
        limitations.forEach((l) => fork.BuyLimitations.addNode(l));
        return fork;
      }),
    });
  }
};

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

const allEtypes = [
  "EItemType::Artifact",
  "EItemType::Attach",
  "EItemType::Consumable",
  "EItemType::Detector",
  "EItemType::Grenade",
  "EItemType::MutantLoot",
  "EItemType::Other",
];
