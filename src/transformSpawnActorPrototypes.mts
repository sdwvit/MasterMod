import { ERank, ESpawnType, GetStructType } from "s2cfgtojson";
import { Meta, WithSID } from "./prepare-configs.mjs";
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
export const transformSpawnActorPrototypes: Meta["entriesTransformer"] = (entries: GearEntries, { filePath }) => {
  if (!filePath.includes("GameLite/GameData/SpawnActorPrototypes/WorldMap_WP/")) {
    return null;
  }
  let newEntries: GearEntries | null = null;
  switch (entries.SpawnType) {
    case "ESpawnType::DestructibleObject":
      if (preplacedDestructibleItems.some((i) => entries.SpawnedPrototypeSID?.includes(i)) && entries.ItemGeneratorSettings) {
        Object.values(entries.ItemGeneratorSettings.entries).forEach((e) => {
          Object.values(e.entries?.ItemGenerators.entries || {}).forEach((ie) => {
            if (ie.entries?.PrototypeSID) {
              newEntries = entries;
              logger.info(`Found preplaced destructible object: ${ie.entries.PrototypeSID}. Hiding it.`);
              totals.DestructibleObject++;
              ie.entries.PrototypeSID = "Milk";
            }
          });
        });
      }
      break;
    /*case "ESpawnType::ItemContainer":
      if (entries.ItemGeneratorSettings?.entries && lootSIDs.has(entries.SpawnedPrototypeSID)) {
        totals.ItemContainer++;
        logger.info(`Found preplaced ItemContainer: ${entries.SpawnedPrototypeSID}. Hiding it.`);
        const res: Partial<GearEntries> = {
          SpawnOnStart: false,
          SpawnType: entries.SpawnType,
          SID: entries.SID,
          ItemGeneratorSettings: entries.ItemGeneratorSettings,
        };

        if (entries.ItemSID) res.ItemSID = entries.ItemSID;
        if (entries.PackOfItemsPrototypeSID) res.PackOfItemsPrototypeSID = entries.PackOfItemsPrototypeSID;

        newEntries = res as GearEntries;
      }

      break;*/
    case "ESpawnType::Item":
      const isMedkitReplacement = entries.ItemSID?.includes("Medkit") || entries.PackOfItemsPrototypeSID?.includes("Medkit");
      const isGearReplacement = preplacedGear.some((i) => entries.ItemSID?.includes(i)) && !attachmentsOrQuestItems.has(entries.ItemSID);
      if (isGearReplacement || isMedkitReplacement) {
        logger.info(`Found preplaced Item: ${entries.ItemSID || entries.PackOfItemsPrototypeSID}. Hiding it.`);
        if (isMedkitReplacement) {
          totals.Medkit++;
        }
        if (isGearReplacement) {
          totals.Gear++;
        }
        const res: Partial<GearEntries> = {
          SpawnOnStart: false,
          SpawnType: entries.SpawnType,
          SID: entries.SID,
        };

        if (entries.ItemSID) res.ItemSID = entries.ItemSID;
        if (entries.PackOfItemsPrototypeSID) res.PackOfItemsPrototypeSID = entries.PackOfItemsPrototypeSID;

        newEntries = res as GearEntries;
      }
      break;
    default:
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
}>["entries"];

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
    readFileAndGetStructs<WithSID>("ItemPrototypes/AttachPrototypes.cfg").map((e) => e.entries.SID),
    [
      "Gun_Partner_SR",
      "Gun_Sotnyk_AR_GS",
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
