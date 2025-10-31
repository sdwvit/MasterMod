import { EffectPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
const oncePerFile = new Set<string>();
/**
 * Makes some consumables last longer.
 * Also negates KillVolumeEffect (borderguard instakill)
 */
export const transformEffectPrototypes: EntriesTransformer<EffectPrototype> = async (struct, context) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(
      new Struct({
        __internal__: {
          rawName: "AimingFOVX16Effect",
          isRoot: true,
        },
        SID: "AimingFOVX16Effect",
        Type: "EEffectType::AimingFOV",
        ValueMin: "-85%",
        ValueMax: "-85%",
        bIsPermanent: true,
        Positive: "EBeneficial::Negative",
      }) as EffectPrototype,
    );
  }

  if (struct.SID === "KillVolumeEffect") {
    return Object.assign(struct.fork(), {
      ApplyExtraEffectPrototypeSIDs: struct.ApplyExtraEffectPrototypeSIDs.map(() => "empty").fork(true),
    });
  }
  if (consumables.has(struct.SID)) {
    return Object.assign(struct.fork(), { Duration: struct.Duration * 10 });
  }
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
