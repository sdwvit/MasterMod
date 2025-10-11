import { AttachPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

/**
 * Increases the cost of Attachments by 10x.
 */
export const transformAttachPrototypes: EntriesTransformer<AttachPrototype> = (entries) => {
  if (entries.Cost) {
    return Object.assign(entries.fork(), { Cost: entries.Cost * 10 });
  }
  return null;
};
transformAttachPrototypes.files = ["/AttachPrototypes.cfg"];
transformAttachPrototypes._name = "Increase attachment cost by 10x";
