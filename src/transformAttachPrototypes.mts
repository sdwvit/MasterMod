import { Meta } from "./prepare-configs.mjs";
import { AttachPrototype, GetStructType } from "s2cfgtojson";

/**
 * Increases cost of Attachments by 10x.
 */
export const transformAttachPrototypes: Meta["entriesTransformer"] = (entries: AttachPrototype["entries"]) => {
  if (!entries.Cost) {
    return null;
  }
  return { Cost: entries.Cost * 10 };
};
