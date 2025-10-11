import { ArtifactPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

/**
 * Remove an essential flag from various items
 */
export const transformQuestArtifactPrototypes: EntriesTransformer<ArtifactPrototype> = (struct) => {
  if (struct.IsQuestItem) {
    return Object.assign(struct.fork(), { IsQuestItem: false });
  }
  return null;
};
transformQuestArtifactPrototypes.files = ["/QuestArtifactPrototypes.cfg"];
transformQuestArtifactPrototypes._name = "Remove an essential flag from QuestArtifactPrototypes";
