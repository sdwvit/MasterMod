import { Meta } from "./prepare-configs.mjs";
import { EffectPrototype, GetStructType } from "s2cfgtojson";

/**
 * Makes some consumables last longer.
 * Also negates KillVolumeEffect (borderguard instakill)
 * @param entries
 */
export const transformEffectPrototypes: Meta["entriesTransformer"] = (entries: EffectPrototype["entries"]) => {
  if (entries.SID === "KillVolumeEffect") {
    entries.ApplyExtraEffectPrototypeSIDs.entries = Object.fromEntries(
      Object.entries(entries.ApplyExtraEffectPrototypeSIDs.entries).map((e) => {
        e[1] = "empty";
        return e;
      }),
    );
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
