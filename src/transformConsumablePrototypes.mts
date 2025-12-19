import { ConsumablePrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";
import { MovementSpeedEffect5PSID } from "./transformEffectPrototypes.mts";

export const transformConsumablePrototypes: EntriesTransformer<ConsumablePrototype> = async (struct) => {
  if (struct.SID === "Energetic") {
    const fork = struct.fork();
    fork.EffectPrototypeSIDs = struct.EffectPrototypeSIDs.fork();
    fork.EffectPrototypeSIDs.addNode(MovementSpeedEffect5PSID, MovementSpeedEffect5PSID);
    fork.AlternativeEffectPrototypeSIDs = struct.AlternativeEffectPrototypeSIDs.fork();
    fork.AlternativeEffectPrototypeSIDs.addNode(MovementSpeedEffect5PSID, MovementSpeedEffect5PSID);
    fork.ShouldShowEffects = struct.ShouldShowEffects.fork();
    fork.ShouldShowEffects.addNode(true, MovementSpeedEffect5PSID);
    fork.EffectsDisplayTypes = struct.EffectsDisplayTypes.fork();
    fork.EffectsDisplayTypes.addNode("EEffectDisplayType::ValueAndTime", MovementSpeedEffect5PSID);
    return fork;
  }
};
transformConsumablePrototypes.files = ["/ConsumablePrototypes.cfg"];
