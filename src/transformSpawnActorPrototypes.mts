import { AttachPrototype, SpawnActorPrototype, WeaponPrototype } from "s2cfgtojson";
import { logger } from "./logger.mts";

import { EntriesTransformer } from "./metaType.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
import { allStashes } from "./stashes.mjs";

/**
 * Removes preplaced items from the map. Like medkits, destructible items contents, and gear.
 */
export const transformSpawnActorPrototypes: EntriesTransformer<SpawnActorPrototype> = async (struct, context) => {
  let fork = struct.fork();

  switch (struct.SpawnType) {
    case "ESpawnType::DestructibleObject": {
      fork = transformDestructibleObjects(struct, fork);
      break;
    }
    case "ESpawnType::Item": {
      fork = transformItems(struct, fork);
      break;
    }
    case "ESpawnType::ItemContainer": {
      fork = rememberAndEmptyStash(struct, fork);
      break;
    }
  }

  if (fork && fork.entries().length) {
    return fork;
  }

  return null;
};

const attachmentsOrQuestItems = new Set([
  ...(await readFileAndGetStructs<AttachPrototype>("ItemPrototypes/AttachPrototypes.cfg")).map((e) => e?.SID),
  ...(
    await readFileAndGetStructs<WeaponPrototype>("ItemPrototypes/WeaponPrototypes.cfg", (s) =>
      s.split("//--------------UNIQUE-WEAPONS--------------").pop(),
    )
  ).map((e) => e?.SID),
]);

export const totals = {
  DestructibleObject: 0,
  Gear: 0,
  Medkit: 0,
  ItemContainer: 0,
};
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

const containers = new Set([
  "BlueBox",
  "BigSafe",
  "SmallSafe",
  "Bag",
  "Backpack",
  "BackpackGrave_g",
  "BackpackGrave_h",
  "BackpackGrave_i",
  "BackpackGrave_j",
  "PackOfItemsBase",
  "BasicFoodCache",
  "BasicClueStatsCache",
  "BasicMixedCache",
  "NewbieCacheContainer",
  "ExperiencedCacheContainer",
  "VeteranCacheContainer",
  "MasterCacheContainer",
  "CarouselExplosionBag",
]);

transformSpawnActorPrototypes.files = ["GameLite/GameData/SpawnActorPrototypes/WorldMap_WP/"];
transformSpawnActorPrototypes.contains = true;
transformSpawnActorPrototypes.contents = [...preplacedDestructibleItems, "Medkit", ...preplacedGear, ...containers];
transformSpawnActorPrototypes._name = "Remove preplaced items from the map";

function transformDestructibleObjects(struct: SpawnActorPrototype, fork: SpawnActorPrototype) {
  if (!(preplacedDestructibleItems.some((i) => struct.SpawnedPrototypeSID?.includes(i)) && struct.ItemGeneratorSettings)) {
    return;
  }

  const igs = struct.ItemGeneratorSettings.map(([_k, e]) => {
    const fork = e.fork();
    const ig = e.ItemGenerators.map(([_k, ie]) => {
      if (!ie?.PrototypeSID) {
        return;
      }

      logger.info(`Found preplaced destructible object: ${ie?.PrototypeSID}. Hiding it.`);
      totals.DestructibleObject++;

      return Object.assign(ie.fork(), { PrototypeSID: "Milk" });
    });

    if (!ig.entries().length) {
      return;
    }

    ig.__internal__.bpatch = true;
    fork.ItemGenerators = ig;
    return fork;
  });
  if (!igs.entries().length) {
    return;
  }
  igs.__internal__.bpatch = true;
  fork.ItemGeneratorSettings = igs;
  return fork;
}

function transformItems(struct: SpawnActorPrototype, fork: SpawnActorPrototype) {
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
  return Object.assign(fork, { SpawnOnStart: false }) as SpawnActorPrototype;
}

function rememberAndEmptyStash(struct: SpawnActorPrototype, fork: SpawnActorPrototype) {
  if (struct.ClueVariablePrototypeSID !== "EmptyInherited" || !containers.has(struct.SpawnedPrototypeSID)) {
    return fork;
  }
  totals.ItemContainer++;
  allStashes[struct.SID] = struct;
  fork.SpawnOnStart = false;

  return fork;
}
