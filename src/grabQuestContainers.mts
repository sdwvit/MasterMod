import { QuestNodePrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";
import { transformSpawnActorPrototypes } from "./transformSpawnActorPrototypes.mjs";
import { finishedTransformers } from "./meta.mjs";
import { waitFor } from "./waitFor.mjs";
import { allStashes } from "./stashes.mjs";
import { questContainers } from "./questContainers.mjs";

export const grabQuestContainers: EntriesTransformer<QuestNodePrototype> = async (struct) => {
  if (struct.NodeType === "EQuestNodeType::ItemAdd") {
    await waitFor(() => finishedTransformers.has(transformSpawnActorPrototypes._name));
    if (allStashes[struct.TargetQuestGuid]) {
      questContainers[struct.TargetQuestGuid] ??= [];
      questContainers[struct.TargetQuestGuid].push(struct.SID);
    }
  }

  return null;
};
grabQuestContainers.files = ["/QuestNodePrototypes/"];
grabQuestContainers.contains = true;
grabQuestContainers.contents = ["EQuestNodeType::ItemAdd"];
grabQuestContainers._name = "grabs all itemAdd nodes and their target sids";
