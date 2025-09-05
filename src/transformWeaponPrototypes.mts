import { Meta } from "./prepare-configs.mjs";
import { WeaponPrototype } from "s2cfgtojson";
import { perRefUrl919PistolExtensionPack } from "./grabExternalMod.mjs";

let oncePerFile = new Set<string>();

export const transformWeaponPrototypes: Meta["entriesTransformer"] = (entries: WeaponPrototype["entries"], context) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(...perRefUrl919PistolExtensionPack.WeaponPrototypes);
  }
  return null;
};
