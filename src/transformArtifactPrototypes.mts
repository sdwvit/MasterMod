import { ArtifactPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";
import { MovementSpeedEffect5PSID } from "./transformEffectPrototypes.mts";

/**
 * Remove an essential flag from various items
 */
export const transformArtifactPrototypes: EntriesTransformer<ArtifactPrototype> = async (struct) => {
  if (struct.IsQuestItem) {
    return Object.assign(struct.fork(), { IsQuestItem: false });
  }
  if (struct.SID === "EArtifactDope") {
    const fork = struct.fork();
    fork.EffectPrototypeSIDs = struct.EffectPrototypeSIDs.fork();
    fork.EffectPrototypeSIDs.addNode(MovementSpeedEffect5PSID, MovementSpeedEffect5PSID);
    fork.ShouldShowEffects = struct.ShouldShowEffects.fork();
    fork.ShouldShowEffects.addNode(true, MovementSpeedEffect5PSID);
    fork.EffectsDisplayTypes = struct.EffectsDisplayTypes.fork();
    fork.EffectsDisplayTypes.addNode("EEffectDisplayType::EffectLevel", MovementSpeedEffect5PSID);
    return fork;
  }
  return null;
};
transformArtifactPrototypes.files = ["/ArtifactPrototypes.cfg"];
