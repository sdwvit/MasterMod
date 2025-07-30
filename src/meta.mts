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
  description: `A collection of various configs aimed to increase game difficulty and make it more interesting.
[hr][/hr]
[h3]All changes to the base game:[/h3]
[list]
\t[*] [Challenge] Traders are not allowed to sell gear.
\t[*] [Challenge] No enemy markers. No threat indicators.
\t[*] [Challenge] Traders or Bartenders are not allowed to buy gear.
\t[*] [Challenge] Reduced drops from bodies.
\t[list]
\t\t[*] 💊 Consumables drop chance is reduced to 1% or less.
\t\t[*] 🔫 Ammo drop chance is reduced to 1% or less, and number of bullets reduced to 5 or so.
\t\t[*] 💣 Grenades drop chance is reduced to 1% or less.
\t[/list]
\t[*] [Balance] NPCs drop armor with very low chance based on armor value.
\t[list]
\t\t[*] Very long list of 312 different loadouts and probability of dropping armor adjustments
\t\t[*] Current formula: (probability = 500 / value_of_armor); for example, newbie armor drop chance is 3.7%, Falcon Spark armor  0.935%.
\t\t[*] The probabilities of dropping the armor are still relatively high (well, approachable), but there is a catch: durability is now capped at 50% and repairs are very costly.
\t\t[*] Dropped armor durability depends on item value as well
\t\t[*] Min durability is random between 1-5%
\t\t[*] Maximum durability is calculated as (min durability + 5000 / value_of_armor); newbie armor would be somewhere between 1 - 38%, while Spark's Falcon would be 1 - 13% durability.
\t[/list]
\t[*] [QoL] Prevents Player and NPCs from being knocked down.
\t[*] [QoL] Removes Fall damage for Player and NPCs.
\t[*] [QoL/Balance] There is now no cooldown between repeatable quests:
\t[list]
\t\t[*] Malachite trader's CD is reduced to 0
\t\t[*] Drabadan's (garbage barman) CD is reduced to 0
\t\t[*] Sich's (zaton trader) CD is reduced to 0
\t\t[*] Sid's (rookie village) CD is reduced to 0
\t\t[*] Chemistry Factory quest iver (todo: update name) CD is reduced to 0
\t\t[*] Rostok barman CD is reduced to 0
\t\t[*] Harpy (Yaniv technician) CD is reduced to 0
\t\t[*] Zalissya barman's CD is reduced to 0
\t[/list]
\t[*] [Challenge] Increases cost of everything:
\t[list]
\t\t[*] 💣 Ammo Cost increased to 400%
\t\t[*] 🛠️ Repair Cost increased to 400%
\t\t[*] ⚙️ Upgrade Cost increased to 400%
\t\t[*] 🍺 Consumables Cost increased to 400%
\t\t[*] 🛡️ Armor Value increased to 400%
\t\t[*] 🔫 Weapon Value increased to 400%
\t\t[*] 🔮 Artifact Cost increased to 400%
\t[/list]
\t[*] [Balance] Increases cost of Attachments by 10x
\t[*] [Challenge / Balance] Increase given and taken damage on Hard difficulty:
\t[list]
\t\t[*] 🔪 Player Weapon Damage increased to 400%
\t\t[*] 🗡️ NPC Weapon Damage increased to 400%
\t\t[*] 🦟️ Mutant Damage increased to 400%
\t[/list]
\t[*] [Balance] Makes some consumables last longer, with the same value (antirad remove radiation slowly):
\t[list]
\t\t[*] 🔋 Limited Edition Energy Drink: Stamina buff now lasts 5 minutes
\t\t[*] 🔋 Energy Drink: Reduced Cost of Stamina Per Action now lasts 5 minutes
\t\t[*] 🔋 Energy Drink: Stamina buff now lasts 7.5 minutes
\t\t[*] 😴 Energy Drink: Sleepiness reduction now lasts 30 seconds
\t\t[*] 🔋 Water: Stamina buff now lasts 50 seconds
\t\t[*] 🔋 Water: Reduced Cost of Stamina Per Action now lasts 5 minutes
\t\t[*] 🩸 Bandage: Bleeding control now lasts 20 seconds
\t\t[*] 🩸 Barvinok: Bleeding control now lasts 30 minutes
\t\t[*] 🩸 Medkit: Bleeding control now lasts 20 seconds
\t\t[*] 🩸 Army Medkit: Bleeding control now lasts 20 seconds
\t\t[*] 🩸 Scientist Medkit: Bleeding control now lasts 20 seconds
\t\t[*] ☢️ Scientist Medkit: Radiation reduction now lasts 20 seconds
\t\t[*] ☢️ Antirad: Radiation reduction now lasts 20 seconds
\t\t[*] ☢️ Beer: Radiation reduction now lasts 20 seconds
\t\t[*] ☢️ Vodka: Radiation reduction now lasts 20 seconds
\t\t[*] ☢️ Dvupalov Vodka: Radiation reduction now lasts 100 seconds
\t\t[*] 🧠 Dvupalov Vodka: PSY Protection now lasts 15 minutes
\t\t[*] 🧠 PSY Block: PSY Protection now lasts 10 minutes
\t\t[*] 🏋️ Hercules: Weight buff now lasts 50 minutes
\t[/list]
\t[*] [Balance] All vanilla mutants don't have armor:
\t[list]
\t\t[*] 🐶 BlindDog's Strike Protection is set to 0.00001
\t\t[*] 🩸 Bloodsucker's Strike Protection is set to 0.00001
\t\t[*] 🐗 Boar's Strike Protection is set to 0.00001
\t\t[*] 🧙🏻‍♂️ Burer's Strike Protection is set to 0.00001
\t\t[*] 🐈 Cat's Strike Protection is set to 0.00001
\t\t[*] 🦁 Chimera's Strike Protection is set to 0.00001
\t\t[*] 🧠 Controller's Strike Protection is set to 0.00001
\t\t[*] 🦌 Deer's Strike Protection is set to 0.00001
\t\t[*] 🐷 Flesh's Strike Protection is set to 0.00001
\t\t[*] 👻 Poltergeist's Strike Protection is set to 0.00001
\t\t[*] 🐶 PseudoDog's Strike Protection is set to 0.00001
\t\t[*] 🧌 Pseudogiant's Strike Protection is set to 0.00001
\t\t[*] 🤿 Snork's Strike Protection is set to 0.00001
\t\t[*] 🐀 Tushkan's Strike Protection is set to 0.00001
\t[/list]
\t[*] [Challenge] Removes preplaced around the map items:
\t[list]
\t\t[*] 🍔 Wooden Boxes don't drop food
\t\t[*] 🩹 Metal Crates don't drop medkits or bandages
\t\t[*] 🔫 Wooden Ammo Crates don't drop ammo
\t\t[*] 🍔 Wooden DSP Crates don't drop food
\t\t[*] 🥠 3067 instances of destructible objects now don't drop items
\t\t[*] 🪃 411 instances of preplaced weapons or armor were removed (no more falcon / exo rush)
\t\t[*] 💊 759 instances of preplaced medkits were removed
\t[/list]
[/list]
[hr][/hr]
[h3]Mod compatibility:[/h3]
Here is a list of modified files:
[list]
\t[*] DifficultyPrototypes.cfg
\t[*] EffectPrototypes.cfg
\t[*] DynamicItemGenerator.cfg
\t[*] AttachPrototypes.cfg
\t[*] ObjPrototypes.cfg
\t[*] ObjPrototypes/
\t\t[list]
\t\t\t[*] GeneralNPCObjPrototypes.cfg
\t\t\t[*] BlindDog.cfg
\t\t\t[*] Bloodsucker.cfg
\t\t\t[*] Boar.cfg
\t\t\t[*] Burer.cfg
\t\t\t[*] Cat.cfg
\t\t\t[*] Chimera.cfg
\t\t\t[*] Controller.cfg
\t\t\t[*] Deer.cfg
\t\t\t[*] Flesh.cfg
\t\t\t[*] MutantBase.cfg
\t\t\t[*] Poltergeist.cfg
\t\t\t[*] PseudoDog.cfg
\t\t\t[*] Pseudogiant.cfg
\t\t\t[*] Snork.cfg
\t\t\t[*] Tushkan.cfg
\t\t[/list]
\t[*] QuestNodePrototypes/
\t\t[list]
\t\t\t[*] BodyParts_Malahit.cfg
\t\t\t[*] RSQ01.cfg
\t\t\t[*] RSQ04.cfg
\t\t\t[*] RSQ05.cfg
\t\t\t[*] RSQ06_C00___SIDOROVICH.cfg
\t\t\t[*] RSQ07_C00_TSEMZAVOD.cfg
\t\t\t[*] RSQ08_C00_ROSTOK.cfg
\t\t\t[*] RSQ09_C00_MALAHIT.cfg
\t\t\t[*] RSQ10_C00_HARPY.cfg
\t\t[/list]
\t[*] SpawnActorPrototypes/WorldMap_WP/4222 various configs
\t[*] TradePrototypes.cfg
[/list]

[hr][/hr]
[h3]Source code:[/h3]

This mod is open source and hosted on [url=https://github.com/sdwvit/MasterMod]github[/url].
I aim to eventually make a collection with mods that are inspired by Stalker Anomaly/GAMMA.
All changes have been tested against fresh save file. Some of these changes won't work with older saves.`,
  changenote: "Add NoThreatMarkers, add NoEnemyMarkers",
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
