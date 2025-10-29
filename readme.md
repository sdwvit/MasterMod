# Code generator for my Stalker 2 mod config files

## Requirements:

- Node.js [24 or later](https://nodejs.org/en/download/current) (with *.mts typescript loader support).
- The official [STALKER2ZoneKit](https://store.epicgames.com/en-US/p/stalker-2-zone-kit).
- [Optional] https://github.com/trumank/repak if you want to quickly test pre 1.6 mods
- [Optional] if you fork it and want to publish with own modifications https://developer.valvesoftware.com/wiki/SteamCMD

## Usage

1. Install the required tools.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the generator:
   ```bash
    npm run prepare
    ```

---
### Mod compatibility:

Here is a list of extended files (this mod uses new files, so it is compatible with other mods that don't modify the same SIDs):

- `ALifePrototypes`:
  - `ALifeDirectorScenarioPrototypes`
- `ArtifactPrototypes`:
  - `QuestArtifactPrototypes`
- `GameData`:
  - `BarbedWirePrototypes`
  - `DifficultyPrototypes`
  - `EffectPrototypes`
  - `ItemGeneratorPrototypes`
  - `MeshGeneratorPrototypes`
  - `MeshPrototypes`
  - `ObjPrototypes`
  - `RelationPrototypes`
  - `StashPrototypes`
  - `TradePrototypes`
  - `UpgradePrototypes`
- `DialogPoolPrototypes`:
  - `GroupAgnostic_Army`
  - `GroupAgnostic_Bandits`
  - `GroupAgnostic_FreeStalkers`
  - `GroupAgnostic_Monolith`
- `DialogPrototypes`:
  - `Malahit_Hub_DialogueOnEntrance`
  - `RSQ01_Dialog_Warlock_RSQ`
  - `RSQ04_Dialog_Drabadan_RSQ`
  - `RSQ05_Dialog_Sich_RSQ`
  - `RSQ06_Dialog_Sidorovich_RSQ`
  - `RSQ07_Dialog_Barmen_RSQ`
  - `RSQ08_Dialog_Barmen_RSQ`
  - `RSQ09_Dialog_Spica_RSQ`
  - `RSQ10_Dialog_Harpy_RSQ`
- `GlobalVariablePrototypes`:
  - `CluePrototypes`
- `ItemGeneratorPrototypes`:
  - `DynamicItemGenerator`
  - `Gamepass_ItemGenerators`
- `QuestRewardsPrototypes`:
  - `RSQ00_Reward`
  - `RSQ01_Reward`
  - `RSQ04_Reward`
  - `RSQ05_Reward`
  - `RSQ06_Reward`
  - `RSQ07_Reward`
  - `RSQ08_Reward`
  - `RSQ09_Reward`
  - `RSQ10_Reward`
- `ItemPrototypes`:
  - `ArmorPrototypes`
  - `ArtifactPrototypes`
  - `AttachPrototypes`
  - `QuestItemPrototypes`
  - `WeaponPrototypes`
- `ObjPrototypes`:
  - `BlindDog`
  - `Bloodsucker`
  - `Boar`
  - `Burer`
  - `Cat`
  - `Chimera`
  - `Controller`
  - `Deer`
  - `Flesh`
  - `GeneralNPCObjPrototypes`
  - `MutantBase`
  - `Poltergeist`
  - `PseudoDog`
  - `Pseudogiant`
  - `QuestObjPrototypes`
  - `Snork`
  - `Tushkan`
- `QuestNodePrototypes`:
  - `BodyParts_Malahit`
  - `E03_SQ01_C1`
  - `RSQ01`
  - `RSQ01_C01`
  - `RSQ01_C02`
  - `RSQ01_C03`
  - `RSQ01_C04`
  - `RSQ01_C05`
  - `RSQ01_C06`
  - `RSQ04`
  - `RSQ04_C01`
  - `RSQ04_C02`
  - `RSQ04_C03`
  - `RSQ04_C04`
  - `RSQ04_C05`
  - `RSQ04_C06`
  - `RSQ04_C07`
  - `RSQ04_C08`
  - `RSQ04_C09`
  - `RSQ04_C10`
  - `RSQ05`
  - `RSQ05_C01`
  - `RSQ05_C02`
  - `RSQ05_C04`
  - `RSQ05_C05`
  - `RSQ05_C07`
  - `RSQ05_C08`
  - `RSQ05_C09`
  - `RSQ05_C10`
  - `RSQ06_C00___SIDOROVICH`
  - `RSQ06_C01___K_Z`
  - `RSQ06_C02___K_M`
  - `RSQ06_C03___K_B`
  - `RSQ06_C04___K_S`
  - `RSQ06_C05___B_B`
  - `RSQ06_C06___B_A`
  - `RSQ06_C07___B_A`
  - `RSQ06_C08___B_A`
  - `RSQ06_C09___S_P`
  - `RSQ07_C00_TSEMZAVOD`
  - `RSQ07_C01_K_Z`
  - `RSQ07_C02_K_M`
  - `RSQ07_C03_K_M`
  - `RSQ07_C04_K_B`
  - `RSQ07_C05_B_B`
  - `RSQ07_C06_B_A`
  - `RSQ07_C07_B_A`
  - `RSQ07_C08_B_A`
  - `RSQ07_C09_S_P`
  - `RSQ08_C00_ROSTOK`
  - `RSQ08_C01_K_M`
  - `RSQ08_C02_K_B`
  - `RSQ08_C03_K_S`
  - `RSQ08_C04_B_B`
  - `RSQ08_C05_B_B`
  - `RSQ08_C06_B_A`
  - `RSQ08_C07_B_A`
  - `RSQ08_C08_B_A`
  - `RSQ08_C09_S_P`
  - `RSQ09_C00_MALAHIT`
  - `RSQ09_C01_K_M`
  - `RSQ09_C02_K_M`
  - `RSQ09_C03_K_M`
  - `RSQ09_C04_K_S`
  - `RSQ09_C05_B_B`
  - `RSQ09_C06_B_A`
  - `RSQ09_C07_B_A`
  - `RSQ09_C08_B_A`
  - `RSQ09_C09_S_P`
  - `RSQ10_C00_HARPY`
  - `RSQ10_C01_K_M`
  - `RSQ10_C02_K_M`
  - `RSQ10_C03_K_S`
  - `RSQ10_C04_K_S`
  - `RSQ10_C05_B_B`
  - `RSQ10_C06_B_A`
  - `RSQ10_C07_B_A`
  - `RSQ10_C08_B_A`
  - `RSQ10_C09_S_P`
- `CharacterWeaponSettingsPrototypes`:
  - `NPCWeaponSettingsPrototypes`
- `WeaponData`:
  - `WeaponGeneralSetupPrototypes`

## License

Free for non-commercial use. For commercial use, please contact GSC - authors of this game - for a license.
Copying or modifying the code should keep the author mentioned in the comments (https://github.com/sdwvit).