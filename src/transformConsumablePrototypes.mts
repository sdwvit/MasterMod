import { ConsumablePrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";
import { MovementSpeedEffect5PTmpSID } from "./transformEffectPrototypes.mts";

export const transformConsumablePrototypes: EntriesTransformer<ConsumablePrototype> = async (struct) => {
  if (struct.SID === "Energetic") {
    const fork = struct.fork();
    fork.EffectPrototypeSIDs = struct.EffectPrototypeSIDs.fork();
    fork.EffectPrototypeSIDs.addNode(MovementSpeedEffect5PTmpSID, MovementSpeedEffect5PTmpSID);
    fork.AlternativeEffectPrototypeSIDs = struct.AlternativeEffectPrototypeSIDs.fork();
    fork.AlternativeEffectPrototypeSIDs.addNode(MovementSpeedEffect5PTmpSID, MovementSpeedEffect5PTmpSID);
    fork.ShouldShowEffects = struct.ShouldShowEffects.fork();
    fork.ShouldShowEffects.addNode(true, MovementSpeedEffect5PTmpSID);
    fork.EffectsDisplayTypes = struct.EffectsDisplayTypes.fork();
    fork.EffectsDisplayTypes.addNode("EEffectDisplayType::ValueAndTime", MovementSpeedEffect5PTmpSID);
    return fork;
  }
};
transformConsumablePrototypes.files = ["/ConsumablePrototypes.cfg"];
