import { Meta } from "./prepare-configs.mjs";
import { AttachPrototype, Struct } from "s2cfgtojson";

/**
 * Increases the cost of Attachments by 10x.
 */
export const transformAttachPrototypes: Meta<AttachPrototype>["entriesTransformer"] = (entries) => {
  if (entries.Cost) {
    return new Struct({ Cost: entries.Cost * 10 }) as AttachPrototype;
  }
  return null;
};
