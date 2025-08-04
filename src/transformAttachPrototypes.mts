import { Meta } from "./prepare-configs.mjs";
import { GetStructType } from "s2cfgtojson";

/**
 * Increases cost of Attachments by 10x.
 */
export const transformAttachPrototypes: Meta["entriesTransformer"] = (
  entries: AttachPrototypes["entries"],
  { filePath },
) => {
  if (!filePath.includes("AttachPrototypes.cfg")) {
    return entries;
  }
  if (!entries.Cost) {
    return null;
  }
  return { Cost: entries.Cost * 10 };
};

type AttachPrototypes = GetStructType<{ Cost: number; SID: string }>;
