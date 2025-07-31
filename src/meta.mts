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
  description: `A collection of various configs aimed to increase game difficulty and make it more interesting.[h3][/h3]
[hr][/hr]
[h3]All changes to the base game:[/h3]
[list]
 [*] [Challenge] Traders are not allowed to sell gear
 [*] [Challenge] No enemy markers. No threat indicators
 [*] [Challenge] Traders or Bartenders are not allowed to buy gear
 [*] [Challenge] Reduced drops from bodies
 [list]
  [*] 💊 Consumables drop chance is reduced to 1% or less
  [*] 🔫 Ammo drop chance is reduced to 1% or less, and number of bullets reduced to 5 or so
  [*] 💣 Grenades drop chance is reduced to 1% or less
 [/list]
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
 [list]
  [*] Malachite trader's CD is reduced to 0
  [*] Drabadan's (garbage barman) CD is reduced to 0
  [*] Sich's (zaton trader) CD is reduced to 0
  [*] Sid's (rookie village) CD is reduced to 0
  [*] Chemistry Factory quest iver (todo: update name) CD is reduced to 0
  [*] Rostok barman CD is reduced to 0
  [*] Harpy (Yaniv technician) CD is reduced to 0
  [*] Zalissya barman's CD is reduced to 0
 [/list]
 [*] [Challenge] Increases cost of everything
 [list]
  [*] 💣 Ammo Cost increased to 400
  [*] 🛠️ Repair Cost increased to 400
  [*] ⚙️ Upgrade Cost increased to 400
  [*] 🍺 Consumables Cost increased to 400
  [*] 🛡️ Armor Value increased to 400
  [*] 🔫 Weapon Value increased to 400
  [*] 🔮 Artifact Cost increased to 400
 [/list]
 [*] [Balance] Increases cost of Attachments by 10x
 [*] [Challenge / Balance] Increase given and taken damage on Hard difficulty
 [list]
  [*] 🔪 Player Weapon Damage increased to 400%
  [*] 🗡️ NPC Weapon Damage increased to 400%
  [*] 🦟️ Mutant Damage increased to 400%
 [/list]
 [*] [Balance] Makes some consumables last longer, with the same value (antirad remove radiation slowly
 [list]
  [*] 🔋 Limited Edition Energy Drink: Stamina buff now lasts 5 minutes
  [*] 🔋 Energy Drink: Reduced Cost of Stamina Per Action now lasts 5 minutes
  [*] 🔋 Energy Drink: Stamina buff now lasts 7.5 minutes
  [*] 😴 Energy Drink: Sleepiness reduction now lasts 30 seconds
  [*] 🔋 Water: Stamina buff now lasts 50 seconds
  [*] 🔋 Water: Reduced Cost of Stamina Per Action now lasts 5 minutes
  [*] 🩸 Bandage: Bleeding control now lasts 20 seconds
  [*] 🩸 Barvinok: Bleeding control now lasts 30 minutes
  [*] 🩸 Medkit: Bleeding control now lasts 20 seconds
  [*] 🩸 Army Medkit: Bleeding control now lasts 20 seconds
  [*] 🩸 Scientist Medkit: Bleeding control now lasts 20 seconds
  [*] ☢️ Scientist Medkit: Radiation reduction now lasts 20 seconds
  [*] ☢️ Antirad: Radiation reduction now lasts 20 seconds
  [*] ☢️ Beer: Radiation reduction now lasts 20 seconds
  [*] ☢️ Vodka: Radiation reduction now lasts 20 seconds
  [*] ☢️ Dvupalov Vodka: Radiation reduction now lasts 100 seconds
  [*] 🧠 Dvupalov Vodka: PSY Protection now lasts 15 minutes
  [*] 🧠 PSY Block: PSY Protection now lasts 10 minutes
  [*] 🏋️ Hercules: Weight buff now lasts 50 minutes
 [/list]
 [*] [Balance] All vanilla mutants don't have armor
 [list]
  [*] 🐶 BlindDog's Strike Protection is set to 0.00001
  [*] 🩸 Bloodsucker's Strike Protection is set to 0.00001
  [*] 🐗 Boar's Strike Protection is set to 0.00001
  [*] 🧙🏻‍♂️ Burer's Strike Protection is set to 0.00001
  [*] 🐈 Cat's Strike Protection is set to 0.00001
  [*] 🦁 Chimera's Strike Protection is set to 0.00001
  [*] 🧠 Controller's Strike Protection is set to 0.00001
  [*] 🦌 Deer's Strike Protection is set to 0.00001
  [*] 🐷 Flesh's Strike Protection is set to 0.00001
  [*] 👻 Poltergeist's Strike Protection is set to 0.00001
  [*] 🐶 PseudoDog's Strike Protection is set to 0.00001
  [*] 🧌 Pseudogiant's Strike Protection is set to 0.00001
  [*] 🤿 Snork's Strike Protection is set to 0.00001
  [*] 🐀 Tushkan's Strike Protection is set to 0.00001
 [/list]
 [*] [Challenge] Removes preplaced around the map items
 [list]
  [*] 🍔 Wooden Boxes don't drop food
  [*] 🩹 Metal Crates don't drop medkits or bandages
  [*] 🔫 Wooden Ammo Crates don't drop ammo
  [*] 🍔 Wooden DSP Crates don't drop food
  [*] 🥠 3067 instances of destructible objects now don't drop items
  [*] 🪃 411 instances of preplaced weapons or armor were removed (no more falcon / exo rush
  [*] 💊 759 instances of preplaced medkits were removed
 [/list]
[/list]
[hr][/hr]
[h3]Source code:[/h3]
This mod is open source and hosted on [url=https://github.com/sdwvit/MasterMod]github[/url].[h3][/h3]
I aim to eventually make a collection with mods that are inspired by Stalker Anomaly/GAMMA.[h3][/h3]
All changes have been tested against fresh save file. Some of these changes won't work with older saves.`,
  changenote: "Reupload because of SDK bug.",
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
