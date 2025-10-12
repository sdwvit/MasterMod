import { AttachPrototype, SpawnActorPrototype, Struct, WeaponPrototype } from "s2cfgtojson";
import { logger } from "./logger.mts";

import { EntriesTransformer } from "./metaType.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";

/**
 * Removes preplaced items from the map. Like medkits, destructible items contents, and gear.
 */
export const transformSpawnActorPrototypes: EntriesTransformer<SpawnActorPrototype> = (struct) => {
  switch (struct.SpawnType) {
    case "ESpawnType::DestructibleObject": {
      return transformDestructibleObjects(struct);
    }
    case "ESpawnType::Item": {
      return transformItems(struct);
    }
    case "ESpawnType::ItemContainer": {
      //  return transformItemContainers(struct);
    }
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
transformSpawnActorPrototypes.contents = [...preplacedDestructibleItems, "Medkit", ...preplacedGear];
transformSpawnActorPrototypes._name = "Remove preplaced items from the map";

function transformDestructibleObjects(struct: SpawnActorPrototype) {
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

function transformItems(struct: SpawnActorPrototype) {
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
  return Object.assign(struct.fork(), { SpawnOnStart: false }) as SpawnActorPrototype;
}

// disables all item container loot. so no stashes ever, except for quest ones
// this has to wait for new sdk release to allow us to listen to stash clues events
// if that is ever planned.
function transformItemContainers(struct: SpawnActorPrototype) {
  if (struct.ClueVariablePrototypeSID !== "EmptyInherited") {
    return null;
  }

  if (!containers.has(struct.SpawnedPrototypeSID)) {
    return null;
  }

  if (!struct.ItemGeneratorSettings) {
    return null;
  }

  const fork = struct.fork();
  const igs = struct.ItemGeneratorSettings?.map(([_k, e]) => {
    const fork = e.fork();
    const ig = e.ItemGenerators.map(([_k, ie]) => {
      if (!ie?.PrototypeSID) {
        return;
      }
      return Object.assign(ie.fork(), { PrototypeSID: "empty" });
    });
    if (!ig.entries().length) {
      return;
    }
    fork.ItemGenerators = ig;
    return fork;
  });
  if (!igs.entries().length) {
    return;
  }

  fork.ItemGeneratorSettings = igs;
  return fork;
}
