import { ObjPrototype } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";

/**
 * Adds trade prototypes to all technicians and guides.
 */
export const transformQuestObjPrototypes: EntriesTransformer<ObjPrototype> = async (struct) => {
  if (techniciansAndTheirTradePrototypes.has(struct.SID)) {
    const fork = Object.assign(struct.fork(), {
      TradePrototypeSID: techniciansAndTheirTradePrototypes.get(struct.SID),
    });
    if (!struct.ItemGeneratorPrototypeSID) {
      fork.ItemGeneratorPrototypeSID = "MainTraderItemGeneratorV1";
    }
    return fork;
  }
  if (guidesAndTheirTradePrototypes[struct.SID]) {
    const fork = Object.assign(struct.fork(), { TradePrototypeSID: guidesAndTheirTradePrototypes[struct.SID] });
    if (!struct.ItemGeneratorPrototypeSID) {
      fork.ItemGeneratorPrototypeSID = "MainTraderItemGeneratorV1";
    }
    return fork;
  }
};
transformQuestObjPrototypes.files = ["/QuestObjPrototypes.cfg"];

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
  ["CorpusGarpia", "Technician_Yanov_TradePrototype"],
  ["CorpusMedlak", "PowerPlugTechnician_TradeItemGenerator"],
]);

const guidesAndTheirTradePrototypes = {
  TerriconGuider: "Guide_TradePrototype", // kukuha
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
  NoonBaseGuider: "Guide_TradePrototype", // masina
  SkadovskGuider: "Guide_TradePrototype", // cervonec
  ShipyardGuider: "Guide_TradePrototype",
  NeutralVolk: "Guide_TradePrototype",
  NeutralGarik: "Guide_TradePrototype",
  NeutralDadaLena: "Guide_TradePrototype",
  ScientistViktorKoska: "Guide_TradePrototype", // malachite
  NeutralMuhomor: "Guide_TradePrototype", // eger, Himzavod
  DutyMarsal: "Guide_TradePrototype", // concrete plant
  FreedomLaguha: "Guide_TradePrototype", // rostok
  CorpusTelegraf: "Guide_TradePrototype", // pripyat
};

/**
 * Technician_ChemicalPlant_TradePrototype // sells T2-T3 attachments
 * PowerPlugTechnician_TradeItemGenerator// T2-T4 attachments
 * Asylum_Technician_TradePrototype // T2
 */
