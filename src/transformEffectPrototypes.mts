import { Meta } from "./prepare-configs.mjs";
import { EffectPrototype, Struct } from "s2cfgtojson";

/**
 * Makes some consumables last longer.
 * Also negates KillVolumeEffect (borderguard instakill)
 * @param entries
 */
export const transformEffectPrototypes: Meta<EffectPrototype>["entriesTransformer"] = (entries) => {
  if (entries.SID === "KillVolumeEffect") {
    Object.keys(entries.ApplyExtraEffectPrototypeSIDs).forEach((k) => {
      entries.ApplyExtraEffectPrototypeSIDs[k] = "empty";
    });
    return entries;
  }
  if (!consumables.has(entries.SID)) {
    return null;
  }
  return new Struct({ Duration: entries.Duration * 10 });
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
