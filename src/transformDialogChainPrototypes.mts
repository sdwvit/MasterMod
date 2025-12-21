import { DialogChainPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";

let oncePerTransformer = false;

/**
 */
export const transformDialogChainPrototypes: EntriesTransformer<DialogChainPrototype> = async (struct) => {
  if (!oncePerTransformer) {
    oncePerTransformer = true;
  }
  return null;
};
transformDialogChainPrototypes.files = [];
