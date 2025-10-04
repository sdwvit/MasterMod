import { EffectPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";

/**
 * Makes some consumables last longer.
 * Also negates KillVolumeEffect (borderguard instakill)
 * @param struct
 */
export const transformEffectPrototypes: EntriesTransformer<EffectPrototype> = (struct) => {
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
transformEffectPrototypes.files = ["/EffectPrototypes.cfg"];
transformEffectPrototypes._name = "Make some consumables last longer";

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
