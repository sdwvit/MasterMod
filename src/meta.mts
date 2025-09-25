import { Meta } from "./prepare-configs.mjs";
import { transformTradePrototypes } from "./transformTradePrototypes.mjs";
import { transformQuestNodePrototypes } from "./transformQuestNodePrototypes.mjs";
import { totals as spawnTotals, transformSpawnActorPrototypes } from "./transformSpawnActorPrototypes.mjs";
import { mobs, transformMobs } from "./transformMobs.mjs";
import { transformEffectPrototypes } from "./transformEffectPrototypes.mjs";
import { transformDifficultyPrototypes } from "./transformDifficultyPrototypes.mjs";
import { transformDynamicItemGenerator } from "./transformDynamicItemGenerator.mjs";
import { transformObjPrototypes } from "./transformObjPrototypes.mjs";
import { transformAttachPrototypes } from "./transformAttachPrototypes.mjs";
import { transformStashPrototypes } from "./transformStashPrototypes.mjs";
import { transformItemGeneratorPrototypes } from "./transformItemGeneratorPrototypes.mjs";
import { transformALifeDirectorScenarioPrototypes } from "./transformALifeDirectorScenarioPrototypes.mjs";
import { transformArmorPrototypes } from "./transformArmorPrototypes.mjs";
import { transformUpgradePrototypes } from "./transformUpgradePrototypes.mjs";
import { repeatingQuestsDialogPrototypes, repeatingQuestsQuestNodePrototypes, repeatingQuestsQuestRewardsPrototypes } from "./repeatingQuests.mjs";
import { transformNPCWeaponSettingsPrototypes } from "./transformNPCWeaponSettingsPrototypes.mjs";
import { transformWeaponGeneralSetupPrototypes } from "./transformWeaponGeneralSetupPrototypes.mts";
import { transformQuestRewardsPrototypes } from "./transformQuestRewardsPrototypes.mjs";
import { transformDialogPrototypes } from "./transformDialogPrototypes.mjs";
import { logger } from "./logger.mjs";
import { transformWeaponPrototypes } from "./transformWeaponPrototypes.mjs";
import { transformMeshPrototypes } from "./transformMeshPrototypes.mjs";
import { transformCharacterWeaponSettingsPrototypes } from "./transformCharacterWeaponSettingsPrototypes.mjs";
import { transformWeaponAttributesPrototypes } from "./transformWeaponAttributesPrototypes.mjs";
import { transformQuestObjPrototypes } from "./transformQuestObjPrototypes.mjs";

export const meta: Meta = {
  description: `A collection of various configs aimed to increase game difficulty and make it more interesting.[h3][/h3]
[hr][/hr]
[h3]All changes to the base game:[/h3]
[list]
 [*] [Challenge] No enemy markers. No threat indicators.
 [*] [Challenge] Armors don't take head slot (except for SEVA's), but also don't protect from PSY damage, so you need to use helmets.
 [*] [QoL] Prevents Player and NPCs from being knocked down.
 [*] [QoL] Removes Fall damage for Player and NPCs.
 [*] [QoL] Removes instakill effect from invisible border guards as well as spawned guards.
 [*] [Challenge / QoL] Way more lively zone, now spawning all mutant bosses and bigger battles.
 [*] [QoL/Balance] There is now no cooldown between repeatable quests.
 [*] [Challenge] Increases cost of everything to 400% (💣 ammo, 🛠️ repair, ⚙️ upgrade, 🍺 consumables, 🛡️ armor, 🔫 weapon, 🔮 artifact).
 [*] [Balance] Increases cost of Attachments to 1000%.
 [*] [Balance] Repeatable Quest Rewards are increased to 400%, but are made random with 25% spread both ways.
 [*] [Balance] Rifles default scopes can now be detached and sold.
 [*] [QoL] Unlocks blocking upgrades. 
 [*] [QoL] Unique weapons are now compatible with basic scopes.
 [*] [Challenge] Traders are not allowed to sell gear.
 [*] [Challenge] Traders or Bartenders are not allowed to buy gear.
 [*] [Challenge / Balance] 🔪🗡🦟️ Increase given and taken damage on Hard difficulty to 400%.
 [*] [Balance] Makes some consumables last longer, with the same value (antirad removes radiation slowly, 10x longer, but with the same value).
 [*] [Balance] Removes armor from vanilla mutants.
 [*] [Balance] NPCs drop armor, but it is damaged and will cost a lot to repair.
 [*] [Challenge] Reduced 💊 Consumables, 🔫 Ammo, and 💣 Grenades drops from bodies and stashes.
 [*] [Challenge] 🥠 7674 destructible objects now don't drop items (🍔 Wooden Boxes, 🍔 Plywood Crates, 🩹 Metal Crates, 🔫 Wooden Ammo Crates).
 [*] [Challenge] 🪃 431 instances of preplaced weapons or armor were removed (no more falcon / exo rush).
 [*] [Challenge] 💊 97 instances of preplaced medkits were removed.
 [*] [Challenge] 🧰 1166 instances of stashes were nerfed. 
[/list]
[hr][/hr]
[h3]Source code:[/h3]
This mod is open source and hosted on [url=https://github.com/sdwvit/MasterMod]github[/url].[h3][/h3]
[h3][/h3]
All changes have been tested against fresh save file. Some of these changes won't work with older saves.`,
  changenote: "Compatibility fix for 1.6.",
  getEntriesTransformer: ({ filePath }) => {
    const transformers = [
      filePath.endsWith("/DynamicItemGenerator.cfg") && transformDynamicItemGenerator,
      (filePath.endsWith("/GameData/ObjPrototypes.cfg") || filePath.endsWith("/ObjPrototypes/GeneralNPCObjPrototypes.cfg")) && transformObjPrototypes,
      filePath.endsWith("/DifficultyPrototypes.cfg") && transformDifficultyPrototypes,
      filePath.endsWith("/AttachPrototypes.cfg") && transformAttachPrototypes,
      filePath.endsWith("/EffectPrototypes.cfg") && transformEffectPrototypes,
      filePath.endsWith("/NPCWeaponSettingsPrototypes.cfg") && transformNPCWeaponSettingsPrototypes,
      mobs.some((m) => filePath.endsWith(`/${m}`)) && transformMobs,
      false && filePath.includes("GameLite/GameData/SpawnActorPrototypes/WorldMap_WP/") && transformSpawnActorPrototypes, // skip expensive generation
      repeatingQuestsQuestNodePrototypes.some((q) => filePath.endsWith(`/${q}`)) && transformQuestNodePrototypes,
      repeatingQuestsQuestRewardsPrototypes.some((q) => filePath.endsWith(`/${q}`)) && transformQuestRewardsPrototypes,
      repeatingQuestsDialogPrototypes.some((q) => filePath.endsWith(`/${q}`)) && transformDialogPrototypes,
      filePath.endsWith("/TradePrototypes.cfg") && transformTradePrototypes,
      filePath.endsWith("/StashPrototypes.cfg") && transformStashPrototypes,
      (filePath.endsWith("/ItemGeneratorPrototypes.cfg") || filePath.endsWith("/ItemGeneratorPrototypes/Gamepass_ItemGenerators.cfg")) &&
        transformItemGeneratorPrototypes,
      filePath.endsWith("/ALifeDirectorScenarioPrototypes.cfg") && transformALifeDirectorScenarioPrototypes,
      filePath.endsWith("/ArmorPrototypes.cfg") && transformArmorPrototypes,
      filePath.endsWith("/UpgradePrototypes.cfg") && transformUpgradePrototypes,
      filePath.endsWith("/WeaponGeneralSetupPrototypes.cfg") && transformWeaponGeneralSetupPrototypes,
      filePath.endsWith("/WeaponPrototypes.cfg") && transformWeaponPrototypes,
      filePath.endsWith("/MeshPrototypes.cfg") && transformMeshPrototypes,
      filePath.endsWith("/CharacterWeaponSettingsPrototypes.cfg") && transformCharacterWeaponSettingsPrototypes,
      filePath.endsWith("/WeaponAttributesPrototypes") && transformWeaponAttributesPrototypes,
      filePath.endsWith("/QuestObjPrototypes.cfg") && transformQuestObjPrototypes,
    ].filter(Boolean) as Meta["entriesTransformer"][];

    if (transformers.length === 0) {
      return null;
    }
    return (entries, context) => {
      return transformers.reduce((acc, f) => f(acc, context) as typeof entries, entries);
    };
  },
  onFinish() {
    logger.log("Removed preplaced items:", spawnTotals);
  },
};
