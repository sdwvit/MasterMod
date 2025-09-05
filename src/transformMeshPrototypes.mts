import { Meta } from "./prepare-configs.mjs";
import { MeshPrototype } from "s2cfgtojson";
import { perRefUrl919PistolExtensionPack } from "./grabExternalMod.mjs";

let oncePerFile = new Set<string>();

export const transformMeshPrototypes: Meta["entriesTransformer"] = (entries: MeshPrototype["entries"], context) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(...perRefUrl919PistolExtensionPack.MeshPrototypes);
  }
  return null;
};
