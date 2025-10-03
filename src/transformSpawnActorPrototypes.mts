import { ERank, ESpawnType, GetStructType, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
import { logger } from "./logger.mts";
export const totals = {
  DestructibleObject: 0,
  Gear: 0,
  Medkit: 0,
  ItemContainer: 0,
};

/**
 * Removes preplaced items from the map. Like medkits, destructible items contents, and gear.
 */
export const transformSpawnActorPrototypes: Meta<GearEntries>["entriesTransformer"] = (struct, { filePath }) => {
  if (!filePath.includes("GameLite/GameData/SpawnActorPrototypes/WorldMap_WP/")) {
    return null;
  }
  let newEntries: GearEntries | null = null;
  switch (struct.SpawnType) {
    case "ESpawnType::DestructibleObject": {
      if (!(preplacedDestructibleItems.some((i) => struct.SpawnedPrototypeSID?.includes(i)) && struct.ItemGeneratorSettings)) {
        return;
      }
      const fork = struct.fork();

      const igs = struct.ItemGeneratorSettings.map(([_k, e]) => {
        const fork = e.fork();
        const igs = e.ItemGenerators.map(([_k, ie]) => {
          if (!ie?.PrototypeSID) {
            return;
          }

          logger.info(`Found preplaced destructible object: ${ie?.PrototypeSID}. Hiding it.`);
          totals.DestructibleObject++;

          return Object.assign(ie.fork(), { PrototypeSID: "Milk" });
        });

        if (!igs.entries().length) {
          return;
        }

        fork.ItemGenerators = igs;
        return fork;
      });
      if (!igs.entries().length) {
        return;
      }
      fork.ItemGeneratorSettings = igs;
      return fork;
    }
    case "ESpawnType::Item": {
      const isMedkitReplacement = struct.ItemSID?.includes("Medkit") || struct.PackOfItemsPrototypeSID?.includes("Medkit");
      const isGearReplacement = preplacedGear.some((i) => struct.ItemSID?.includes(i)) && !attachmentsOrQuestItems.has(struct.ItemSID);
      if (!(isGearReplacement || isMedkitReplacement)) {
        return;
      }
      logger.info(`Found preplaced Item: ${struct.ItemSID || struct.PackOfItemsPrototypeSID}. Hiding it.`);
      if (isMedkitReplacement) {
        totals.Medkit++;
      }
      if (isGearReplacement) {
        totals.Gear++;
      }
      return Object.assign(struct.fork(), { SpawnOnStart: false }) as GearEntries;
    }
  }

  return newEntries;
};

export type GearEntries = GetStructType<{
  SpawnType: ESpawnType;
  ItemSID: string;
  SID: string;
  SpawnOnStart: boolean;
  SpawnedPrototypeSID: string;
  ItemGeneratorSettings: {
    PlayerRank: ERank;
    ItemGenerators: { PrototypeSID: string }[];
  }[];
  PackOfItemsPrototypeSID: string;
}>;

const preplacedGear = ["Gun", "Armor", "Helmet"];
const preplacedDestructibleItems = [
  "D_WoodenBox_01",
  "D_WoodenBox_02",
  "D_WoodenBox_03",
  "D_WoodenBox_04",
  "D_MetallCrate_01",
  "D_WoodenAmmoCrate_01",
  "D_WoodenDSPCrate_01",
  "D_WoodenDSPCrate_02",
  "D_WoodenDSPCrate_03",
];
const attachmentsOrQuestItems = new Set(
  [].concat(
    readFileAndGetStructs<Struct & { SID: string }>("ItemPrototypes/AttachPrototypes.cfg").map((e) => e?.SID),
    [
      "GunGonta_SP",
      "GunNightStalker_HG",
      "Gun_ProjectY_HG",
      "Gun_Deadeye_HG",
      "Gun_Krivenko_HG",
      "Gun_Star_HG",
      "Gun_Encourage_HG",
      "Gun_GStreet_HG",
      "Gun_Shakh_SMG",
      "Gun_Spitter_SMG",
      "Gun_Silence_SMG",
      "Gun_RatKiller_SMG",
      "Gun_Spitfire_SMG",
      "Gun_Combatant_AR",
      "Gun_Drowned_AR",
      "Gun_Lummox_AR",
      "Gun_Decider_AR",
      "Gun_Merc_AR",
      "Gun_Sotnyk_AR",
      "Gun_Sharpshooter_AR",
      "Gun_Unknown_AR",
      "Gun_Trophy_AR",
      "Gun_SOFMOD_AR",
      "Gun_S15_AR",
      "Gun_Predator_SG",
      "Gun_Sledgehammer_SG",
      "Gun_Texas_SG",
      "Gun_Tank_MG",
      "Gun_Lynx_SR",
      "Gun_Partner_SR",
      "Gun_Whip_SR",
      "Gun_Cavalier_SR",
      "Gun_SkifGun_HG",
      "GunSVU_Sniper_Duga_SP",
      "GunGauss_Scar_SP",

      "GunGonta_SP_GS",
      "GunGauss_Scar_SP",
      "GunNightStalker_HG",
      "GunUDP_Deadeye_HG",
      "Gun_Krivenko_HG_GS",
      "Gun_S15_AR",
      "Gun_Sharpshooter_AR_GS",
      "Gun_Cavalier_SR_GS",
      "Gun_Unknown_AR_GS",
      "Gun_GStreet_HG_GS",
      "Gun_Encourage_HG_GS",
      "Gun_Star_HG_GS",
      "Gun_Shakh_SMG_GS",
      "Gun_RatKiller_SMG_GS",
      "Gun_Silence_SMG_GS",
      "Gun_Spitter_SMG_GS",
      "Gun_Spitfire_SMG_GS",
      "Gun_Lynx_SR_GS",
      "Gun_Whip_SR_GS",
      "Gun_Partner_SR_GS",
      "Gun_SOFMOD_AR_GS",
      "Gun_Predator_SG_GS",
      "Gun_Sledgehammer_SG_GS",
      "Gun_Texas_SG_GS",
      "Gun_Combatant_AR_GS",
      "Gun_Drowned_AR_GS",
      "Gun_Lummox_AR_GS",
      "Gun_Merc_AR_GS",
      "Gun_Tank_MG_GS",
      "Gun_Sotnyk_AR_GS",
      "Gun_Trophy_AR_GS",
      "Gun_Decider_AR_GS",
      "Gun_Kaimanov_HG_GS",
    ], // quest/unique items
  ),
);
