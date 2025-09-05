import { Meta } from "./prepare-configs.mjs";
import { CharacterWeaponSettingsPrototype } from "s2cfgtojson";
import { perRefUrl919PistolExtensionPack } from "./grabExternalMod.mjs";

let oncePerFile = new Set<string>();

export const transformCharacterWeaponSettingsPrototypes: Meta["entriesTransformer"] = (
  entries: CharacterWeaponSettingsPrototype["entries"],
  context,
) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(...perRefUrl919PistolExtensionPack.CharacterWeaponSettingsPrototypes);
  }
  return null;
};
