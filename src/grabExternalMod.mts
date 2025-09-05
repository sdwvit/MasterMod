import path from "node:path";
import {
  AttachPrototype,
  CharacterWeaponSettingsPrototype,
  ItemGeneratorPrototype,
  MeshPrototype,
  Struct,
  WeaponAttributesPrototype,
  WeaponGeneralSetupPrototype,
  WeaponPrototype,
} from "s2cfgtojson";
import fs from "node:fs";
import { logger } from "./logger.mjs";

const root = path.join(import.meta.dirname, "..");
const assets = path.join(root, "assets");

function grab919PistolExtensionPack() {
  const mod = path.join(assets, "919PistolExtensionPack", "GameLite", "GameData");

  const weaponDataPath = path.join(mod, "WeaponData");
  const itemPrototypesPath = path.join(mod, "ItemPrototypes");
  const meshPrototypesPath = path.join(mod, "MeshPrototypes");

  const files = [
    //  path.join(itemPrototypesPath, "Sig_AttachMagazinePrototypes.cfg"),
    //  path.join(itemPrototypesPath, "Sig_WeaponPrototypes.cfg"),
    //  path.join(meshPrototypesPath, "MeshPrototype_SIG.cfg"),
    //  path.join(weaponDataPath, "CharacterWeaponSettingsPrototypes", "zz_SIGPlayerWeaponSettingsPrototypes.cfg"),
    //  path.join(weaponDataPath, "WeaponAttributesPrototypes", "zz_SIGPlayerWeaponAttributesPrototypes.cfg"),
    //  path.join(weaponDataPath, "WeaponGeneralSetupPrototypes", "P320_WeaponGeneralSetupPrototypes.cfg"),
    //  path.join(weaponDataPath, "WeaponGeneralSetupPrototypes", "Sig_WeaponGeneralSetupPrototypes.cfg"),
  ];

  const parsed = files.map((file) => Struct.fromString(fs.readFileSync(file, "utf-8"))).flat();
  const perRefUrl = parsed.reduce(
    (acc, struct) => {
      if (!struct.refurl.startsWith("../")) {
        throw new Error(`Unexpected refurl: ${struct.refurl}`);
      }
      const key = struct.refurl.slice(3, -4);
      acc[key] ||= [];
      acc[key].push(struct);
      return acc;
    },
    {
      ItemGeneratorPrototypes: [] as ItemGeneratorPrototype[],
      AttachPrototypes: [] as AttachPrototype[],
      WeaponPrototypes: [] as WeaponPrototype[],
      MeshPrototypes: [] as MeshPrototype[],
      CharacterWeaponSettingsPrototypes: [] as CharacterWeaponSettingsPrototype[],
      WeaponAttributesPrototypes: [] as WeaponAttributesPrototype[],
      WeaponGeneralSetupPrototypes: [] as WeaponGeneralSetupPrototype[],
    },
  );

  logger.info(`Grabbed ${parsed.length} structs from 919PistolExtensionPack mod.`);
  return perRefUrl;
}

export const perRefUrl919PistolExtensionPack = grab919PistolExtensionPack();
