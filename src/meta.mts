import { Meta } from "./prepare-configs.mjs";
import { transformTradePrototypes } from "./transformTradePrototypes.mjs";
import { repeatingQuests, transformRepeatingQuests } from "./transformRepeatingQuests.mjs";
import { transformSpawnActorPrototypes, totals as spawnTotals } from "./transformSpawnActorPrototypes.mjs";
import { mobs, transformMobs } from "./transformMobs.mjs";
import { transformEffectPrototypes } from "./transformEffectPrototypes.mjs";
import { transformDifficultyPrototypes } from "./transformDifficultyPrototypes.mjs";
import { transformDynamicItemGenerator } from "./transformDynamicItemGenerator.mjs";
import { transformObjPrototypes } from "./transformObjPrototypes.mjs";
import { transformAttachPrototypes } from "./transformAttachPrototypes.mjs";
import { transformStashPrototypes } from "./transformStashPrototypes.mjs";
import { transformItemGeneratorPrototypes } from "./transformItemGeneratorPrototypes.mjs";

export const meta: Meta = {
  interestingFiles: [
    "AttachPrototypes.cfg",
    "DifficultyPrototypes.cfg",
    "EffectPrototypes.cfg",
    "DynamicItemGenerator.cfg",
    "ItemGeneratorPrototypes.cfg",
    "Gamepass_ItemGenerators.cfg",
    "ObjPrototypes/GeneralNPCObjPrototypes.cfg",
    "GameData/ObjPrototypes.cfg",
    ...repeatingQuests,
    "StashPrototypes.cfg",
    "TradePrototypes.cfg",
    ...mobs,
    "SpawnActorPrototypes/WorldMap_WP/", // very expensive
  ],
  interestingContents: [],
  prohibitedIds: [],
  interestingIds: [],
  description: `A collection of various configs aimed to increase game difficulty and make it more interesting.[h3][/h3]
[hr][/hr]
[h3]All changes to the base game:[/h3]
[list]
 [*] [Challenge] No enemy markers. No threat indicators
 [*] [Balance] NPCs drop armor with very low chance based on armor value
 [list]
  [*] Very long list of 312 different loadouts and probability of dropping armor adjustments
  [*] Current formula: (probability = 500 / value_of_armor); for example, newbie armor drop chance is 3.7%, Falcon Spark armor  0.935
  [*] The probabilities of dropping the armor are still relatively high (well, approachable), but there is a catch: durability is now capped at 50% and repairs are very costly
  [*] Dropped armor durability depends on item value as well
  [*] Min durability is random between 1-5
  [*] Maximum durability is calculated as (min durability + 5000 / value_of_armor); newbie armor would be somewhere between 1 - 38%, while Spark's Falcon would be 1 - 13% durability
 [/list]
 [*] [QoL] Prevents Player and NPCs from being knocked down
 [*] [QoL] Removes Fall damage for Player and NPCs
 [*] [QoL/Balance] There is now no cooldown between repeatable quests
 [*] [Challenge] Increases cost of everything to 400% (💣 ammo, 🛠️ repair, ⚙️ upgrade, 🍺 consumables, 🛡️ armor, 🔫 weapon, 🔮 artifact)
 [*] [Balance] Increases cost of Attachments to 1000%
 [*] [Challenge] Traders are not allowed to sell gear
 [*] [Challenge] Traders or Bartenders are not allowed to buy gear
 [*] [Challenge / Balance] 🔪🗡🦟️ Increase given and taken damage on Hard difficulty to 400%
 [*] [Balance] Makes some consumables last longer, with the same value (antirad removes radiation slowly)
 [list]
  [*] 🔋 Limited Edition Energy Drink: Stamina buff now lasts 5 minutes
  [*] 🔋 Energy Drink: Reduced Cost of Stamina Per Action now lasts 5 minutes
  [*] 🔋 Energy Drink: Stamina buff now lasts 7.5 minutes
  [*] 😴 Energy Drink: Sleepiness reduction now lasts 30 seconds
  [*] 🔋 Water: Stamina buff now lasts 50 seconds
  [*] 🔋 Water: Reduced Cost of Stamina Per Action now lasts 5 minutes
  [*] 🩸 Barvinok: Bleeding control now lasts 30 minutes
  [*] 🩸 Bandage, Medkit, Army Medkit, Scientist Medkit: Bleeding control now lasts 20 seconds
  [*] ☢️ Scientist Medkit, Antirad, Beer, Vodka: Radiation reduction now lasts 20 seconds
  [*] ☢️ Dvupalov Vodka: Radiation reduction now lasts 100 seconds
  [*] 🧠 Dvupalov Vodka: PSY Protection now lasts 15 minutes
  [*] 🧠 PSY Block: PSY Protection now lasts 10 minutes
  [*] 🏋️ Hercules: Weight buff now lasts 50 minutes
 [/list]
 [*] [Balance] Removes armor from vanilla mutants
 [*] [Challenge] Reduced 💊 Consumables, 🔫 Ammo, and 💣 Grenades drops from bodies and stashes
 [*] [Challenge] Removes preplaced gear / items around the map
 [list]
  [*] 🍔 Wooden Boxes, Plywood Crates don't drop food
  [*] 🩹 Metal Crates don't drop medkits or bandages
  [*] 🔫 Wooden Ammo Crates don't drop ammo
  [*] 🥠 7674 instances of destructible objects now don't drop items
  [*] 🪃 431 instances of preplaced weapons or armor were removed (no more falcon / exo rush
  [*] 💊 97 instances of preplaced medkits were removed
  [*] 🧰 1166 instances of stashes were nerfed 
 [/list]
[/list]
[hr][/hr]
[h3]Source code:[/h3]
This mod is open source and hosted on [url=https://github.com/sdwvit/MasterMod]github[/url].[h3][/h3]
I aim to eventually make a collection with mods that are inspired by Stalker GAMMA.[h3][/h3]
All changes have been tested against fresh save file. Some of these changes won't work with older saves.`,
  changenote: "Reduce chance of consumables, ammo, grenades drops from stashes.",
  entriesTransformer: (entries, c) => {
    return [
      transformDynamicItemGenerator,
      transformObjPrototypes,
      transformDifficultyPrototypes,
      transformAttachPrototypes,
      transformEffectPrototypes,
      transformMobs,
      transformSpawnActorPrototypes,
      transformRepeatingQuests,
      transformTradePrototypes,
      transformStashPrototypes,
      transformItemGeneratorPrototypes,
    ].reduce((acc, f) => f(acc, c) as typeof entries, entries);
  },
  onFinish() {
    console.log("Removed preplaced items:", spawnTotals);
  },
};
