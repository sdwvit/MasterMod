import { Meta } from "./prepare-configs.mjs";
import { EffectPrototype, Struct } from "s2cfgtojson";

/**
 * Makes some consumables last longer.
 * Also negates KillVolumeEffect (borderguard instakill)
 * @param struct
 */
export const transformEffectPrototypes: Meta<EffectPrototype>["entriesTransformer"] = (struct) => {
  if (struct.SID === "KillVolumeEffect") {
    return Object.assign(struct.fork(), {
      ApplyExtraEffectPrototypeSIDs: struct.ApplyExtraEffectPrototypeSIDs.map(() => "empty"),
    });
  }
  if (!consumables.has(struct.SID)) {
    return null;
  }

  return Object.assign(struct.fork(), { Duration: struct.Duration * 10 });
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
