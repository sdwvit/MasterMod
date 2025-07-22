import { Entries, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { TraderEntries, transformTradePrototypes } from "./transformTradePrototypes.mjs";
import { repeatingQuests, transformRepeatingQuests } from "./transformRepeatingQuests.mjs";
import { GearEntries, transformSpawnActorPrototypes } from "./transformSpawnActorPrototypes.mjs";
import { mobs, transformMobs } from "./transformMobs.mjs";
import { transformEffectPrototypes } from "./transformEffectPrototypes.mjs";
import { transformDifficultyPrototypes } from "./transformDifficultyPrototypes.mjs";
import { DynamicItemGenerator, transformDynamicItemGenerator } from "./transformDynamicItemGenerator.mjs";
import { ObjPrototypes, transformObjPrototypes } from "./transformObjPrototypes.mjs";
import { transformAttachPrototypes } from "./transformAttachPrototypes.mjs";

/**
 * **AttachPrototypes**: Increases attachment costs by 10x in `AttachPrototypes.cfg`
 * **DifficultyPrototypes**: Boosts Hard difficulty costs (ammo, repair, etc.) by 4x and sets damage multipliers for weapons/armor
 * **DynamicItemGenerator**: Disables trader gear sales, lets NPCs drop armor with custom durability based on cost maps
 * **EffectPrototypes**: Makes consumables last 10x longer by multiplying duration values
 * **Mobs**: Sets mob bullet protection (`Strike`) to 0.0001 for increased vulnerability
 * **ObjPrototypes**: Prevents NPCs from being knocked down and removes fall damage entirely
 * **RepeatingQuests**: Removes timeout for quests by setting `InGameHours` to 0
 * **SpawnActorPrototypes**: Hides preplaced items (medkits, destructible crates, gear) and empties their contents
 * **TradePrototypes**: Blocks traders from selling weapons/armor by modifying `BuyLimitations` in `TradePrototypes.cfg`
 */
export const meta: Meta = {
  interestingFiles: [
    "DynamicItemGenerator.cfg",
    "ObjPrototypes/GeneralNPCObjPrototypes.cfg",
    "GameData/ObjPrototypes.cfg",
    "DifficultyPrototypes.cfg",
    "AttachPrototypes.cfg",
    "EffectPrototypes.cfg",
    ...mobs,
    //"SpawnActorPrototypes/WorldMap_WP/", // very expensive
    ...repeatingQuests,
    "TradePrototypes.cfg",
  ],
  interestingContents: [],
  prohibitedIds: [],
  interestingIds: [],
  description:
    "A collection of various configs aimed to increase game difficulty and make it more interesting. Inspired by Stalker GAMMA, but slightly opinionated.",
  changenote: "Initial release",
  entriesTransformer: (entries, c) => {
    let newEntries = entries as Entries;
    newEntries = transformDynamicItemGenerator(newEntries as DynamicItemGenerator["entries"], c);
    newEntries = transformObjPrototypes(newEntries as ObjPrototypes["entries"], c);
    newEntries = transformDifficultyPrototypes(newEntries as { SID: string }, c);
    newEntries = transformAttachPrototypes(newEntries as { Cost: number }, c);
    newEntries = transformEffectPrototypes(newEntries as { SID: string; Duration: number }, c);
    newEntries = transformMobs(newEntries as { Protection: Struct<{ Strike: number }> }, c);
    newEntries = transformSpawnActorPrototypes(newEntries as GearEntries, c);
    newEntries = transformRepeatingQuests(newEntries as { InGameHours: number }, c);
    newEntries = transformTradePrototypes(newEntries as TraderEntries, c);
    return newEntries;
  },
};
