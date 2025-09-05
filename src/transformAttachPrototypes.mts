import { Meta } from "./prepare-configs.mjs";
import { AttachPrototype, GetStructType } from "s2cfgtojson";
import { perRefUrl919PistolExtensionPack } from "./grabExternalMod.mjs";

let oncePerFile = new Set<string>();
/**
 * Increases cost of Attachments by 10x.
 */
export const transformAttachPrototypes: Meta["entriesTransformer"] = (entries: AttachPrototype["entries"], context) => {
  if (!entries.Cost) {
    return null;
  }
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(...perRefUrl919PistolExtensionPack.AttachPrototypes);
  }
  return { Cost: entries.Cost * 10 };
};
