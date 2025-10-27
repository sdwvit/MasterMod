import { ArtifactPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

/**
 * Remove an essential flag from various items
 */
export const transformArtifactPrototypes: EntriesTransformer<ArtifactPrototype> = async (struct) => {
  if (struct.IsQuestItem) {
    return Object.assign(struct.fork(), { IsQuestItem: false });
  }
  return null;
};
transformArtifactPrototypes.files = ["/ArtifactPrototypes.cfg"];
transformArtifactPrototypes._name = "Remove an essential flag from artifact items";
