# Code generator for my Stalker 2 mod config files

## Requirements:

- Node.js [24 or later](https://nodejs.org/en/download/current) (with *.mts typescript loader support).
- The official [STALKER2ZoneKit](https://store.epicgames.com/en-US/p/stalker-2-zone-kit).
- https://github.com/trumank/repak
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
- `DialogPrototypes`:
  - `RSQ01_Dialog_Warlock_RSQ`
  - `RSQ04_Dialog_Drabadan_RSQ`
  - `RSQ05_Dialog_Sich_RSQ`
  - `RSQ06_Dialog_Sidorovich_RSQ`
  - `RSQ07_Dialog_Barmen_RSQ`
  - `RSQ08_Dialog_Barmen_RSQ`
  - `RSQ09_Dialog_Spica_RSQ`
  - `RSQ10_Dialog_Harpy_RSQ`
- `GameData`:
  - `DifficultyPrototypes`
  - `EffectPrototypes`
  - `ItemGeneratorPrototypes`
  - `ObjPrototypes`
  - `StashPrototypes`
  - `TradePrototypes`
  - `UpgradePrototypes`
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
  - `AttachPrototypes`
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
  - `RSQ01`
  - `RSQ04`
  - `RSQ05`
  - `RSQ06_C00___SIDOROVICH`
  - `RSQ07_C00_TSEMZAVOD`
  - `RSQ08_C00_ROSTOK`
  - `RSQ09_C00_MALAHIT`
  - `RSQ10_C00_HARPY`
- `CharacterWeaponSettingsPrototypes`:
  - `NPCWeaponSettingsPrototypes`
- `WeaponData`:
  - `WeaponGeneralSetupPrototypes`

## License

Free for non-commercial use. For commercial use, please contact GSC - authors of this game - for a license.
Copying or modifying the code should keep the author mentioned in the comments (https://github.com/sdwvit).