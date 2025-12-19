import { EntriesTransformer } from "./metaType.mjs";
import { AIGlobal } from "s2cfgtojson";

export const SPAWN_BUBBLE_FACTOR = 2.5; // 100m -> 250m radius

export const transformAIGlobals: EntriesTransformer<AIGlobal> = async (struct, context) => {
  const fork = struct.fork();

  /*  if (context.filePath.endsWith("/CoreVariables.cfg")) {
    if (struct.__internal__.rawName !== "DefaultConfig") {
      return null;
    }
    fork.ALifeGridVisionRadius = 8500.0;
    fork.GenericModelGridVisionRadius = 7500.0;
    return fork;
  }*/
  if (context.filePath.endsWith("/AIGlobals.cfg")) {
    if (struct.__internal__.rawName !== "AISettings") {
      return null;
    }
    fork.MinALifeDespawnDistance = struct.MinALifeDespawnDistance * SPAWN_BUBBLE_FACTOR ** 2;
    fork.MinALifeSpawnDistance = struct.MinALifeSpawnDistance * SPAWN_BUBBLE_FACTOR ** 2;
    fork.MaxAgentsCount = struct.MaxAgentsCount * SPAWN_BUBBLE_FACTOR ** 2;
    return fork;
  }
};
transformAIGlobals.files = ["/AIGlobals.cfg", "/CoreVariables.cfg"];
