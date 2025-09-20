import { Meta } from "./prepare-configs.mjs";
import { MeshPrototype, Struct } from "s2cfgtojson";
import { perRefUrl919PistolExtensionPack } from "./grabExternalMod.mjs";
import { newArmors } from "./armors.util.mjs";

let oncePerFile = new Set<string>();

export const transformMeshPrototypes: Meta["entriesTransformer"] = (_, context) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(...perRefUrl919PistolExtensionPack.MeshPrototypes);
    const extraMeshes = new Map<string, { SID: string; ID: number; MeshPath: string }>();
    Object.values(newArmors).forEach((newArmor) => {
      if ("MeshPath" in newArmor._extras && "MeshPrototypeSID" in newArmor.entries) {
        const SID = newArmor.entries.MeshPrototypeSID as string;
        const newEntries = { SID, ID: -1, MeshPath: newArmor._extras.MeshPath as string };
        extraMeshes.set(SID, newEntries);
      }
    });
    extraMeshes.forEach((e) => {
      const dummyPossibleItem = new (Struct.createDynamicClass(e.SID))() as MeshPrototype;
      e.ID = context.array.length + context.extraStructs.length;
      dummyPossibleItem.entries = e as MeshPrototype["entries"];
      context.extraStructs.push(dummyPossibleItem);
    });
  }
  return null;
};
