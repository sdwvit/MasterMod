import { ERank, ESpawnType, GetStructType, Struct } from "s2cfgtojson";
import { Meta, WithSID } from "./prepare-configs.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
export const totals = {
  DestructibleObject: 0,
  Gear: 0,
  Medkit: 0,
  ItemContainer: 0,
};
const ALLOW_LOG = false;
const logger = {
  info: (...args: any[]) => {
    if (ALLOW_LOG) {
      console.log(...args);
    }
  },
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
    ["Gun_Partner_SR", "Gun_Sotnyk_AR_GS"], // quest items
  ),
);

const gamePassItemGeneratorPrototypeSIDs = new Set(
  [].concat(
    readFileAndGetStructs<WithSID>("ItemGeneratorPrototypes/Gamepass_ItemGenerators.cfg").map((e) => e.entries.SID),
    readFileAndGetStructs<WithSID>("ItemGeneratorPrototypes.cfg")
      .filter((e) => e.refurl === "ItemGeneratorPrototypes/Gamepass_ItemGenerators.cfg")
      .map((e) => e.entries.SID),
  ),
);
const lootSIDs = new Set([
  "Bag",
  "BlueBox",
  "BigSafe",
  "Backpack",
  "SmallSafe",
  "BackpackGrave_g",
  "BackpackGrave_h",
  "BackpackGrave_i",
  "BackpackGrave_j",
]);
