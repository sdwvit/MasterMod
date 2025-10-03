import { Meta } from "./prepare-configs.mjs";
import { AttachPrototype, Struct } from "s2cfgtojson";

/**
 * Increases the cost of Attachments by 10x.
 */
export const transformAttachPrototypes: Meta<AttachPrototype>["entriesTransformer"] = (entries) => {
  if (entries.Cost) {
    return Object.assign(entries.fork(), { Cost: entries.Cost * 10 });
  }
  return null;
};
