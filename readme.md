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

Here is a list of modified files:

- `GameData`:
  - `DifficultyPrototypes`
  - `EffectPrototypes`
  - `ItemGeneratorPrototypes`
  - `ObjPrototypes`
  - `StashPrototypes`
  - `TradePrototypes`
- `ItemGeneratorPrototypes`:
  - `DynamicItemGenerator`
  - `Gamepass_ItemGenerators`
- `ItemPrototypes`:
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

## License

Free for non-commercial use. For commercial use, please contact GSC - authors of this game - for a license.
Copying or modifying the code should keep the author mentioned in the comments (https://github.com/sdwvit).