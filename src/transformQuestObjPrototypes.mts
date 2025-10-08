import { ObjPrototype } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";
import { logger } from "./logger.mjs";

export const transformQuestObjPrototypes: EntriesTransformer<ObjPrototype> = (struct) => {
  if (techniciansAndTheirTradePrototypes.has(struct.SID)) {
    return Object.assign(struct.fork(), { TradePrototypeSID: techniciansAndTheirTradePrototypes.get(struct.SID) });
  }
  if (guidesAndTheirTradePrototypes[struct.SID]) {
    // todo doesn't work
    return Object.assign(struct.fork(), { TradePrototypeSID: guidesAndTheirTradePrototypes[struct.SID] });
  }
};
transformQuestObjPrototypes.files = ["/QuestObjPrototypes.cfg"];
transformQuestObjPrototypes._name = "Make all technicians sell better attachments";

const techniciansAndTheirTradePrototypes = new Map([
  ["RostokTechnician", "Technician_ChemicalPlant_TradePrototype"],
  ["DiggerKonder", "Asylum_Technician_TradePrototype"],
  ["ZalesieTechnician", "Asylum_Technician_TradePrototype"],
  ["SkadovskTechnician", "PowerPlugTechnician_TradeItemGenerator"],
  ["ShipyardTechnician", "Asylum_Technician_TradePrototype"],
  ["HimzavodTechnician", "Technician_ChemicalPlant_TradePrototype"],
  ["MalachitTechnician", "PowerPlugTechnician_TradeItemGenerator"],
  ["ConcretePlantTechnician", "PowerPlugTechnician_TradeItemGenerator"],
  ["MagnetMemoryPlantTechnician", "PowerPlugTechnician_TradeItemGenerator"],
  ["SparkWorkshopTechnician", "PowerPlugTechnician_TradeItemGenerator"],
  ["Hors", "Technician_ChemicalPlant_TradePrototype"],
  ["Lesnik", "PowerPlugTechnician_TradeItemGenerator"],
  ["Kardan", "PowerPlugTechnician_TradeItemGenerator"],
  ["FlameStepsel", "PowerPlugTechnician_TradeItemGenerator"],
  ["AzimutVartaAntonMarusin", "Technician_ChemicalPlant_TradePrototype"],
  ["VartaSerzEremeev", "Technician_ChemicalPlant_TradePrototype"],
  ["VartaSergeantVeremeev", "Technician_ChemicalPlant_TradePrototype"],
  ["NeutralDadkaAr", "Technician_ChemicalPlant_TradePrototype"],
  ["SIRCAATechnician", "Technician_ChemicalPlant_TradePrototype"],
  ["NeutralKovyraska", "Technician_ChemicalPlant_TradePrototype"],
  ["VartaSerzantIvajlov", "Technician_ChemicalPlant_TradePrototype"],
  ["CorpMedlak", "PowerPlugTechnician_TradeItemGenerator"],
  ["FlameStepsel_Pripyat", "PowerPlugTechnician_TradeItemGenerator"],
  ["VartaSerzantIvajlov_Pripyat", "PowerPlugTechnician_TradeItemGenerator"],
  ["NeutralMultik", "Asylum_Technician_TradePrototype"],
  ["NeutralSemenyc", "Asylum_Technician_TradePrototype"],
  ["DutySerzantHmaruk", "Technician_ChemicalPlant_TradePrototype"],
  ["CorpusGarpia", "PowerPlugTechnician_TradeItemGenerator"],
  ["CorpusMedlak", "PowerPlugTechnician_TradeItemGenerator"],
]);

const guidesAndTheirTradePrototypes = {
  ZalesieGuider: "Guide_TradePrototype",
  ShevchenkoGuider: "Guide_TradePrototype",
  HimzavodGuider: "Guide_TradePrototype",
  MalachitGuider: "Guide_TradePrototype",
  RostokGuider: "Guide_TradePrototype",
  ConcretePlantGuider: "Guide_TradePrototype",
  MagnetMemoryPlantGuider: "Guide_TradePrototype",
  KorogodCampGuider: "Guide_TradePrototype",
  HoghouseGuider: "Guide_TradePrototype",
  RookieVillageGuider: "Guide_TradePrototype",
  LesnikBaseGuider: "Guide_TradePrototype",
};

/**
 * Technician_ChemicalPlant_TradePrototype // sells T2-T3 attachments
 * PowerPlugTechnician_TradeItemGenerator// T2-T4 attachments
 * Asylum_Technician_TradePrototype // T2
 */
