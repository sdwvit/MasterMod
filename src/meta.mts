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
    "\t[*] [Challenge] Traders are not allowed to buy gear.\n" +
    "\t[*] [Balance] NPCs drop armor with very low chance based on armor value.\n" +
    "\t[list]\n" +
    "\t    [*] Very long list of 312 different loadouts and probability of dropping armor adjustments\n" +
    "\t    [*] Current formula: (probability = 500 / value_of_armor); for example, newbie armor drop chance is 3.7%, Falcon Spark armor  0.935%.\n" +
    "\t    [*] The probabilities of dropping the armor are still relatively high (well, approachable), but there is a catch: durability is now capped at 50% and repairs are very costly.\n" +
    "\t    [*] Dropped armor durability depends on item value as well\n" +
    "\t    [*] Min durability is random between 1-5%\n" +
    "\t    [*] Maximum durability is calculated as (min durability + 5000 / value_of_armor); newbie armor would be somewhere between 1 - 38%, while Spark's Falcon would be 1 - 13% durability.\n" +
    "\t[/list]\n" +
    "\t[*] [QoL] Prevents Player and NPCs from being knocked down.\n" +
    "\t[*] [QoL] Removes Fall damage for Player and NPCs.\n" +
    "\t[*] [QoL/Balance] There is now no cooldown between repeatable quests:\n" +
    "    [list]\n" +
    "        [*] Malachite trader gives orders for mutant parts as soon as you finish a previous delivery\n" +
    "        [*] Malachite trader's repeatable quests cooldown is reduced to 0\n" +
    "        [*] Drabadan's (garbage barman) repeatable quests cooldown is reduced to 0\n" +
    "        [*] Sich's (zaton trader) repeatable quests cooldown is reduced to 0\n" +
    "        [*] Sid's (rookie village) repeatable quests cooldown is reduced to 0\n" +
    "        [*] Chemistry Factory quest iver (todo: update name) repeatable quests cooldown is reduced to 0\n" +
    "        [*] Rostok barman repeatable quests cooldown is reduced to 0\n" +
    "        [*] Harpy (Yaniv technician) repeatable quests cooldown is reduced to 0\n" +
    "        [*] Zalissya barman's repeatable quests cooldown is reduced to 0\n" +
    "    [/list]\n" +
    "\t[*] [Challenge] Increases cost of everything:\n" +
    "    [list]\n" +
    "        [*] 💣 Ammo Cost increased to 400%\n" +
    "        [*] 🛠️ Repair Cost increased to 400%\n" +
    "        [*] ⚙️ Upgrade Cost increased to 400%\n" +
    "        [*] 🍺 Consumables Cost increased to 400%\n" +
    "        [*] 🛡️ Armor Value increased to 400%\n" +
    "        [*] 🔫 Weapon Value increased to 400%\n" +
    "        [*] 🔮 Artifact Cost increased to 400%\n" +
    "    [/list]\n" +
    "\t[*] [Balance] Increases cost of Attachments by 10x\n" +
    "\t[*] [Challenge / Balance] Increase given and taken damage on Hard difficulty:\n" +
    "    [list]\n" +
    "        [*] 🔪 Player Weapon Damage increased to 400%\n" +
    "        [*] 🗡️ NPC Weapon Damage increased to 400%\n" +
    "        [*] 🦟️ Mutant Damage increased to 400%\n" +
    "    [/list]\n" +
    "\t[*] [Balance] Makes some consumables last longer, with the same value (antirad remove radiation slowly):\n" +
    "\t[list]\n" +
    "\t    [*] 🔋 Limited Edition Energy Drink: Stamina buff duration increased from 30 seconds to 5 minutes\n" +
    "\t    [*] 🔋 Energy Drink: Reduced Cost of Stamina Per Action duration increased from 30 seconds to 5 minutes\n" +
    "\t    [*] 🔋 Energy Drink: Stamina buff duration increased from 45 seconds to 7.5 minutes\n" +
    "\t    [*] 😴 Energy Drink: Sleepiness reduction duration increased from 3 seconds to 30 seconds\n" +
    "\t    [*] 🔋 Water: Stamina buff duration increased from 5 seconds to 50 seconds\n" +
    "\t    [*] 🔋 Water: Reduced Cost of Stamina Per Action duration increased from 30 seconds to 5 minutes\n" +
    "\t    [*] 🩸 Bandage: Bleeding control duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] 🩸 Barvinok: Bleeding control duration increased from 3 minutes to 30 minutes\n" +
    "\t    [*] 🩸 Medkit: Bleeding control duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] 🩸 Army Medkit: Bleeding control duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] 🩸 Scientist Medkit: Bleeding control duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] ☢️ Scientist Medkit: Radiation reduction duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] ☢️ Antirad: Radiation reduction duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] ☢️ Beer: Radiation reduction duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] ☢️ Vodka: Radiation reduction duration increased from 2 seconds to 20 seconds\n" +
    "\t    [*] ☢️ Dvupalov Vodka: Radiation reduction duration increased from 10 seconds to 100 seconds\n" +
    "\t    [*] 🧠 Dvupalov Vodka: PSY Protection duration increased from 90 seconds to 15 minutes\n" +
    "\t    [*] 🧠 PSY Block: PSY Protection duration increased from 1 minute to 10 minutes\n" +
    "\t    [*] 🏋️ Hercules: Weight buff duration increased from 5 minutes to 50 minutes\n" +
    "    [/list]\n" +
    "\t[*] [Balance] All vanilla mutants don't have armor:\n" +
    "    [list]\n" +
    "\t    [*] 🐶 BlindDog's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🩸 Bloodsucker's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🐗 Boar's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🧙🏻‍♂️ Burer's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🐈 Cat's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🦁 Chimera's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🧠 Controller's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🦌 Deer's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🐷 Flesh's Strike Protection is set to 0.00001\n" +
    "\t    [*] 👻 Poltergeist's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🐶 PseudoDog's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🧌 Pseudogiant's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🤿 Snork's Strike Protection is set to 0.00001\n" +
    "\t    [*] 🐀 Tushkan's Strike Protection is set to 0.00001\n" +
    "    [/list]\n" +
    "\t[*] [Challenge] Removes preplaced around the map items:\n" +
    "\t[list]\n" +
    "\t    [*] 🍔 Wooden Boxes don't drop food\n" +
    "\t    [*] 🩹 Metal Crates don't drop medkits or bandages\n" +
    "\t    [*] 🔫 Wooden Ammo Crates don't drop ammo\n" +
    "\t    [*] 🍔 Wooden DSP Crates don't drop food\n" +
    "\t    [*] 🥠 3067 instances of destructible objects now don't drop items\n" +
    "\t    [*] 🪃 411 instances of preplaced weapons or armor were removed (no more falcon / exo rush)\n" +
    "\t    [*] 💊 759 instances of preplaced medkits were removed\n" +
    "    [/list]\n" +
    "[/list]\n" +
    "[hr][/hr]\n" +
    "[h3]Mod compatibility:[/h3]\n" +
    "Here is a list of modified files:\n" +
    "[list]\n" +
    "    [*] DifficultyPrototypes.cfg\n" +
    "    [*] EffectPrototypes.cfg\n" +
    "    [*] DynamicItemGenerator.cfg\n" +
    "    [*] AttachPrototypes.cfg\n" +
    "    [*] ObjPrototypes.cfg\n" +
    "    [*] ObjPrototypes/\n" +
    "        [list]\n" +
    "            [*] GeneralNPCObjPrototypes.cfg\n" +
    "            [*] BlindDog.cfg\n" +
    "            [*] Bloodsucker.cfg\n" +
    "            [*] Boar.cfg\n" +
    "            [*] Burer.cfg\n" +
    "            [*] Cat.cfg\n" +
    "            [*] Chimera.cfg\n" +
    "            [*] Controller.cfg\n" +
    "            [*] Deer.cfg\n" +
    "            [*] Flesh.cfg\n" +
    "            [*] MutantBase.cfg\n" +
    "            [*] Poltergeist.cfg\n" +
    "            [*] PseudoDog.cfg\n" +
    "            [*] Pseudogiant.cfg\n" +
    "            [*] Snork.cfg\n" +
    "            [*] Tushkan.cfg\n" +
    "        [/list]\n" +
    "    [*] QuestNodePrototypes/\n" +
    "        [list]\n" +
    "            [*] QuestNodePrototypes/BodyParts_Malahit.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ01.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ04.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ05.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ06_C00___SIDOROVICH.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ07_C00_TSEMZAVOD.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ08_C00_ROSTOK.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ09_C00_MALAHIT.cfg\n" +
    "            [*] QuestNodePrototypes/RSQ10_C00_HARPY.cfg\n" +
    "        [/list]\n" +
    "    [*] SpawnActorPrototypes/WorldMap_WP/4222 various configs\n" +
    "    [*] TradePrototypes.cfg\n" +
    "[/list]\n" +
    "\n" +
    "[hr][/hr]\n" +
    "[h3]Source code:[/h3]\n" +
    "\n" +
    "This mod is open source and hosted on [url=https://github.com/sdwvit/MasterMod]github[/url].\n" +
    "I aim to eventually make a collection with mods that are inspired by Stalker Anomaly/GAMMA.\n" +
    "All changes have been tested against fresh save file. Some of these changes won't work with older saves.",
  changenote: "Update for 1.5.2; Add No Enemy Markers mod.",
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
