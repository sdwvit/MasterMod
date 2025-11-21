import { totals as spawnTotals, transformSpawnActorPrototypes } from "./transformSpawnActorPrototypes.mjs";
import { logger } from "./logger.mjs";
import { MetaType } from "./metaType.mjs";
import { transformDynamicItemGenerator } from "./transformDynamicItemGenerator.mjs";
import { transformObjPrototypes } from "./transformObjPrototypes.mjs";
import { transformDifficultyPrototypes } from "./transformDifficultyPrototypes.mjs";
import { transformAttachPrototypes } from "./transformAttachPrototypes.mjs";
import { transformEffectPrototypes } from "./transformEffectPrototypes.mjs";
import { transformNPCWeaponSettingsPrototypes } from "./transformNPCWeaponSettingsPrototypes.mjs";
import { transformMobs } from "./transformMobs.mjs";
import { transformQuestRewardsPrototypes } from "./transformQuestRewardsPrototypes.mts";
import { transformQuestNodePrototypes } from "./transformQuestNodePrototypes.mts";
import { transformTradePrototypes } from "./transformTradePrototypes.mts";
import { transformItemGeneratorPrototypes } from "./transformItemGeneratorPrototypes.mts";
import { transformStashPrototypes } from "./transformStashPrototypes.mts";
import { transformALifeDirectorScenarioPrototypes } from "./transformALifeDirectorScenarioPrototypes.mts";
import { transformArmorPrototypes } from "./transformArmorPrototypes.mts";
import { transformUpgradePrototypes } from "./transformUpgradePrototypes.mts";
import { transformWeaponGeneralSetupPrototypes } from "./transformWeaponGeneralSetupPrototypes.mts";
import { transformQuestObjPrototypes } from "./transformQuestObjPrototypes.mts";
import { transformMeshGeneratorPrototypes } from "./transformMeshGeneratorPrototypes.mts";
import { transformDialogPrototypes } from "./transformDialogPrototypes.mts";
import { transformArtifactPrototypes } from "./transformArtifactPrototypes.mjs";
import { transformQuestArtifactPrototypes } from "./transformQuestArtifactPrototypes.mjs";
import { transformQuestItemPrototypes } from "./transformQuestItemPrototypes.mjs";
import { transformWeaponPrototypes } from "./transformWeaponPrototypes.mjs";
import { transformRelationPrototypes } from "./transformRelationPrototypes.mjs";
import { transformBarbedWirePrototypes } from "./transformBarbedWirePrototypes.mjs";
import { transformMeshPrototypes } from "./transformMeshPrototypes.mjs";
import { transformDialogPoolPrototypes } from "./transformDialogPoolPrototypes.mjs";
import { transformCluePrototypes } from "./transformCluePrototypes.mjs";
import { transformLairPrototypes } from "./transformLairPrototypes.mjs";
import { MergedStructs } from "./merged-structs.mjs";

const structTransformers = [
  transformALifeDirectorScenarioPrototypes,
  transformArmorPrototypes,
  transformArtifactPrototypes,
  transformAttachPrototypes,
  transformBarbedWirePrototypes,
  transformCluePrototypes,
  transformDialogPoolPrototypes,
  transformDialogPrototypes,
  transformDifficultyPrototypes,
  transformDynamicItemGenerator,
  transformEffectPrototypes,
  transformItemGeneratorPrototypes,
  transformLairPrototypes,
  transformMeshGeneratorPrototypes,
  transformMeshPrototypes,
  transformMobs,
  transformNPCWeaponSettingsPrototypes,
  transformObjPrototypes,
  transformQuestArtifactPrototypes,
  transformQuestItemPrototypes,
  transformQuestNodePrototypes,
  transformQuestObjPrototypes,
  transformQuestRewardsPrototypes,
  transformRelationPrototypes,
  transformSpawnActorPrototypes,
  transformStashPrototypes,
  transformTradePrototypes,
  transformUpgradePrototypes,
  transformWeaponGeneralSetupPrototypes,
  transformWeaponPrototypes,
] as const;

export const finishedTransformers = new Set<string>();

export const meta: MetaType<Parameters<(typeof structTransformers)[number]>[0]> = {
  description: `A collection of various configs aimed to increase game difficulty and make it more interesting.[h3][/h3]
[hr][/hr]
[h3]All changes to the base game:[/h3]
[list]
 [*] [Challenge] NPCs bodies don't give stash clues, instead you have to do recurring vendor quests to receive stashes 
 [*] [Challenge] No enemy markers. No threat indicators.
 [*] [Challenge] Armors don't take head slot (except for SEVA's), but also don't protect from PSY damage, so you need to use helmets.
 [*] [Challenge] Reduced 💊 Consumables, 🔫 Ammo, and 💣 Grenades drops from bodies and stashes.
 [*] [Challenge] 🥠 7674 destructible objects now don't drop items (🍔 Wooden Boxes, 🍔 Plywood Crates, 🩹 Metal Crates, 🔫 Wooden Ammo Crates).
 [*] [Challenge] 🪃 431 instances of preplaced weapons or armor were removed (no more falcon / exo rush).
 [*] [Challenge] 💊 97 instances of preplaced medkits were removed.
 [*] [Challenge] 🧰 1166 instances of stashes were nerfed. 
 [*] [Challenge] Traders are not allowed to sell gear.
 [*] [Challenge] Increases cost of everything to 400% (💣 ammo, 🛠️ repair, ⚙️ upgrade, 🍺 consumables, 🛡️ armor, 🔫 weapon, 🔮 artifact).
 [*] [Challenge] Traders or Bartenders are not allowed to buy gear.
 [*] [Challenge] Enemy's weapons damage is increased to be on par with player's weapons.
 [*] [Challenge / Balance] 🔪🗡🦟️ Increase given and taken damage on Hard difficulty to 400%.
 [*] [Challenge / QoL] Way more lively zone, now spawning all mutant bosses and bigger battles.
 [*] [QoL] Prevents Player and NPCs from being knocked down.
 [*] [QoL] Removes Fall damage for Player and NPCs.
 [*] [QoL] Water no longer slows you down or drains your stamina.
 [*] [QoL] X8 Scope compatible with more weapons (more compatibility fixes to come). Added X16 scopes.
 [*] [QoL] Unlocks blocking upgrades. 
 [*] [QoL] Unique weapons are now compatible with basic scopes.
 [*] [QoL] Allows buying/selling/dropping quest items.
 [*] [QoL] Allow unlimited saves on Master (Stalker) difficulty (same as Veteran (Hard)). Re-enables compass, and unlocks settings.
 [*] [QoL] Removes instakill effect from invisible border guards as well as spawned guards.
 [*] [QoL/Balance] There is now no cooldown between repeatable quests.
 [*] [Balance] Makes some consumables last longer, with the same value (antirad removes radiation slowly, 10x longer, but with the same value).
 [*] [Balance] Removes armor from vanilla mutants.
 [*] [Balance] NPCs drop armor, but it is damaged and will cost a lot to repair.
 [*] [Balance] Increases cost of Attachments to 1000%.
 [*] [Balance] Repeatable Quest Rewards are increased to 400%, but are made random with 25% spread both ways.
 [*] [Balance] Rifles default scopes can now be detached and sold.
 [*] [Balance] Unique and fair rewards for each possible variant of repeating quests.
[/list]
[hr][/hr]
[h3]Source code:[/h3]
This mod is open source and hosted on [url=https://github.com/sdwvit/MasterMod]github[/url].[h3][/h3]
[h3][/h3]
All changes have been tested against fresh save file. Some of these changes won't work with older saves.`,
  changenote: `Fixed armor backfilling and droppable flag for headless armor`,
  structTransformers: structTransformers as any,
  onFinish() {
    logger.log("Removed preplaced items:", spawnTotals);
    logger.log("Merged structs:", Object.keys(MergedStructs).length);
  },
  onTransformerFinish(transformer) {
    finishedTransformers.add(transformer.name);
  },
};
