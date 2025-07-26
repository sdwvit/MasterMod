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
  description:
    "A collection of various configs aimed to increase game difficulty and make it more interesting.\n" +
    "[hr][/hr]\n" +
    "[h3]All changes to the base game:[/h3]\n" +
    "[list]\n" +
    "\t[*] [Challenge] Traders are not allowed to sell gear.\n" +
    "\t[*] [Challenge] Traders or Bartenders are not allowed to buy gear.\n" +
    "\t[*] [Challenge] Reduced drops from bodies.\n" +
    "\t[list]\n" +
    "\t\t[*] 💊 Consumables drop chance is reduced to 1% or less.\n" +
    "\t\t[*] 🔫 Ammo drop chance is reduced to 1% or less, and number of bullets reduced to 5 or so.\n" +
    "\t\t[*] 💣 Grenades drop chance is reduced to 1% or less.\n" +
    "\t[/list]\n" +
    "\t[*] [Balance] NPCs drop armor with very low chance based on armor value.\n" +
    "\t[list]\n" +
    "\t\t[*] Very long list of 312 different loadouts and probability of dropping armor adjustments\n" +
    "\t\t[*] Current formula: (probability = 500 / value_of_armor); for example, newbie armor drop chance is 3.7%, Falcon Spark armor  0.935%.\n" +
    "\t\t[*] The probabilities of dropping the armor are still relatively high (well, approachable), but there is a catch: durability is now capped at 50% and repairs are very costly.\n" +
    "\t\t[*] Dropped armor durability depends on item value as well\n" +
    "\t\t[*] Min durability is random between 1-5%\n" +
    "\t\t[*] Maximum durability is calculated as (min durability + 5000 / value_of_armor); newbie armor would be somewhere between 1 - 38%, while Spark's Falcon would be 1 - 13% durability.\n" +
    "\t[/list]\n" +
    "\t[*] [QoL] Prevents Player and NPCs from being knocked down.\n" +
    "\t[*] [QoL] Removes Fall damage for Player and NPCs.\n" +
    "\t[*] [QoL/Balance] There is now no cooldown between repeatable quests:\n" +
    "\t[list]\n" +
    "\t\t[*] Malachite trader's CD is reduced to 0\n" +
    "\t\t[*] Drabadan's (garbage barman) CD is reduced to 0\n" +
    "\t\t[*] Sich's (zaton trader) CD is reduced to 0\n" +
    "\t\t[*] Sid's (rookie village) CD is reduced to 0\n" +
    "\t\t[*] Chemistry Factory quest iver (todo: update name) CD is reduced to 0\n" +
    "\t\t[*] Rostok barman CD is reduced to 0\n" +
    "\t\t[*] Harpy (Yaniv technician) CD is reduced to 0\n" +
    "\t\t[*] Zalissya barman's CD is reduced to 0\n" +
    "\t[/list]\n" +
    "\t[*] [Challenge] Increases cost of everything:\n" +
    "\t[list]\n" +
    "\t\t[*] 💣 Ammo Cost increased to 400%\n" +
    "\t\t[*] 🛠️ Repair Cost increased to 400%\n" +
    "\t\t[*] ⚙️ Upgrade Cost increased to 400%\n" +
    "\t\t[*] 🍺 Consumables Cost increased to 400%\n" +
    "\t\t[*] 🛡️ Armor Value increased to 400%\n" +
    "\t\t[*] 🔫 Weapon Value increased to 400%\n" +
    "\t\t[*] 🔮 Artifact Cost increased to 400%\n" +
    "\t[/list]\n" +
    "\t[*] [Balance] Increases cost of Attachments by 10x\n" +
    "\t[*] [Challenge / Balance] Increase given and taken damage on Hard difficulty:\n" +
    "\t[list]\n" +
    "\t\t[*] 🔪 Player Weapon Damage increased to 400%\n" +
    "\t\t[*] 🗡️ NPC Weapon Damage increased to 400%\n" +
    "\t\t[*] 🦟️ Mutant Damage increased to 400%\n" +
    "\t[/list]\n" +
    "\t[*] [Balance] Makes some consumables last longer, with the same value (antirad remove radiation slowly):\n" +
    "\t[list]\n" +
    "\t\t[*] 🔋 Limited Edition Energy Drink: Stamina buff now lasts 5 minutes\n" +
    "\t\t[*] 🔋 Energy Drink: Reduced Cost of Stamina Per Action now lasts 5 minutes\n" +
    "\t\t[*] 🔋 Energy Drink: Stamina buff now lasts 7.5 minutes\n" +
    "\t\t[*] 😴 Energy Drink: Sleepiness reduction now lasts 30 seconds\n" +
    "\t\t[*] 🔋 Water: Stamina buff now lasts 50 seconds\n" +
    "\t\t[*] 🔋 Water: Reduced Cost of Stamina Per Action now lasts 5 minutes\n" +
    "\t\t[*] 🩸 Bandage: Bleeding control now lasts 20 seconds\n" +
    "\t\t[*] 🩸 Barvinok: Bleeding control now lasts 30 minutes\n" +
    "\t\t[*] 🩸 Medkit: Bleeding control now lasts 20 seconds\n" +
    "\t\t[*] 🩸 Army Medkit: Bleeding control now lasts 20 seconds\n" +
    "\t\t[*] 🩸 Scientist Medkit: Bleeding control now lasts 20 seconds\n" +
    "\t\t[*] ☢️ Scientist Medkit: Radiation reduction now lasts 20 seconds\n" +
    "\t\t[*] ☢️ Antirad: Radiation reduction now lasts 20 seconds\n" +
    "\t\t[*] ☢️ Beer: Radiation reduction now lasts 20 seconds\n" +
    "\t\t[*] ☢️ Vodka: Radiation reduction now lasts 20 seconds\n" +
    "\t\t[*] ☢️ Dvupalov Vodka: Radiation reduction now lasts 100 seconds\n" +
    "\t\t[*] 🧠 Dvupalov Vodka: PSY Protection now lasts 15 minutes\n" +
    "\t\t[*] 🧠 PSY Block: PSY Protection now lasts 10 minutes\n" +
    "\t\t[*] 🏋️ Hercules: Weight buff now lasts 50 minutes\n" +
    "\t[/list]\n" +
    "\t[*] [Balance] All vanilla mutants don't have armor:\n" +
    "\t[list]\n" +
    "\t\t[*] 🐶 BlindDog's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🩸 Bloodsucker's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🐗 Boar's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🧙🏻‍♂️ Burer's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🐈 Cat's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🦁 Chimera's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🧠 Controller's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🦌 Deer's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🐷 Flesh's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 👻 Poltergeist's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🐶 PseudoDog's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🧌 Pseudogiant's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🤿 Snork's Strike Protection is set to 0.00001\n" +
    "\t\t[*] 🐀 Tushkan's Strike Protection is set to 0.00001\n" +
    "\t[/list]\n" +
    "\t[*] [Challenge] Removes preplaced around the map items:\n" +
    "\t[list]\n" +
    "\t\t[*] 🍔 Wooden Boxes don't drop food\n" +
    "\t\t[*] 🩹 Metal Crates don't drop medkits or bandages\n" +
    "\t\t[*] 🔫 Wooden Ammo Crates don't drop ammo\n" +
    "\t\t[*] 🍔 Wooden DSP Crates don't drop food\n" +
    "\t\t[*] 🥠 3067 instances of destructible objects now don't drop items\n" +
    "\t\t[*] 🪃 411 instances of preplaced weapons or armor were removed (no more falcon / exo rush)\n" +
    "\t\t[*] 💊 759 instances of preplaced medkits were removed\n" +
    "\t[/list]\n" +
    "[/list]\n" +
    "[hr][/hr]\n" +
    "[h3]Mod compatibility:[/h3]\n" +
    "Here is a list of modified files:\n" +
    "[list]\n" +
    "\t[*] DifficultyPrototypes.cfg\n" +
    "\t[*] EffectPrototypes.cfg\n" +
    "\t[*] DynamicItemGenerator.cfg\n" +
    "\t[*] AttachPrototypes.cfg\n" +
    "\t[*] ObjPrototypes.cfg\n" +
    "\t[*] ObjPrototypes/\n" +
    "\t\t[list]\n" +
    "\t\t\t[*] GeneralNPCObjPrototypes.cfg\n" +
    "\t\t\t[*] BlindDog.cfg\n" +
    "\t\t\t[*] Bloodsucker.cfg\n" +
    "\t\t\t[*] Boar.cfg\n" +
    "\t\t\t[*] Burer.cfg\n" +
    "\t\t\t[*] Cat.cfg\n" +
    "\t\t\t[*] Chimera.cfg\n" +
    "\t\t\t[*] Controller.cfg\n" +
    "\t\t\t[*] Deer.cfg\n" +
    "\t\t\t[*] Flesh.cfg\n" +
    "\t\t\t[*] MutantBase.cfg\n" +
    "\t\t\t[*] Poltergeist.cfg\n" +
    "\t\t\t[*] PseudoDog.cfg\n" +
    "\t\t\t[*] Pseudogiant.cfg\n" +
    "\t\t\t[*] Snork.cfg\n" +
    "\t\t\t[*] Tushkan.cfg\n" +
    "\t\t[/list]\n" +
    "\t[*] QuestNodePrototypes/\n" +
    "\t\t[list]\n" +
    "\t\t\t[*] BodyParts_Malahit.cfg\n" +
    "\t\t\t[*] RSQ01.cfg\n" +
    "\t\t\t[*] RSQ04.cfg\n" +
    "\t\t\t[*] RSQ05.cfg\n" +
    "\t\t\t[*] RSQ06_C00___SIDOROVICH.cfg\n" +
    "\t\t\t[*] RSQ07_C00_TSEMZAVOD.cfg\n" +
    "\t\t\t[*] RSQ08_C00_ROSTOK.cfg\n" +
    "\t\t\t[*] RSQ09_C00_MALAHIT.cfg\n" +
    "\t\t\t[*] RSQ10_C00_HARPY.cfg\n" +
    "\t\t[/list]\n" +
    "\t[*] SpawnActorPrototypes/WorldMap_WP/4222 various configs\n" +
    "\t[*] TradePrototypes.cfg\n" +
    "[/list]\n" +
    "\n" +
    "[hr][/hr]\n" +
    "[h3]Source code:[/h3]\n" +
    "\n" +
    "This mod is open source and hosted on [url=https://github.com/sdwvit/MasterMod]github[/url].\n" +
    "I aim to eventually make a collection with mods that are inspired by Stalker Anomaly/GAMMA.\n" +
    "All changes have been tested against fresh save file. Some of these changes won't work with older saves.",
  changenote: "Reduce drops of consumables, ammo, and grenades from bodies.",
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
