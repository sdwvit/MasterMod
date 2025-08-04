import { Meta } from "./prepare-configs.mjs";
import { GetStructType } from "s2cfgtojson";

/**
 * Makes some consumables last longer.
 * @param entries
 * @param file
 */
export const transformEffectPrototypes: Meta["entriesTransformer"] = (
  entries: TransformEffect["entries"],
  { filePath },
) => {
  if (!filePath.includes("EffectPrototypes.cfg")) {
    return entries;
  }
  if (!consumables.has(entries.SID)) {
    return null;
  }
  return { Duration: entries.Duration * 10 };
};
const consumables = new Set([
  "EnergeticStamina",
  "EnergeticLimitedStamina",
  "EnergeticSleepiness",
  "BandageBleeding4",
  "MedkitBleeding2",
  "Antirad4",
  "AnomalyVodkaRadiation",
  "HerculesWeight",
  "CinnamonDegenBleeding",
  "BeerAntirad1",
  "VodkaAntirad3",
  "PSYBlockerIncreaseRegen",
  "ArmyMedkitBleeding3",
  "EcoMedkitAntirad3",
  "EcoMedkitBleeding2",
  "WaterStamina2",
  "MagicVodkaPSYProtection",
  "EnergeticStaminaPerAction1",
  "WaterStaminaPerAction1",
  "HerculesWeight_Penalty",
]);
type TransformEffect = GetStructType<{ SID: string; Duration: number }>;
