import { RelationPrototype } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";

/**
 * Fixes some of the relationships
 */
export const transformRelationPrototypes: EntriesTransformer<RelationPrototype> = async (struct) => {
  const fork = struct.fork();

  fork.Relations = struct.Relations.fork();

  fork.Relations["Bandits<->Mercenaries"] = 0;
  fork.Relations["Mercenaries<->Bandits"] = 0;
  fork.Relations["Bandits<->Freedom"] = 0;
  fork.Relations["Freedom<->Bandits"] = 0;
  fork.Relations["Freedom<->Mercenaries"] = 0;
  fork.Relations["Mercenaries<->Freedom"] = 0;

  fork.Relations["Mercenaries<->Duty"] = -800;
  fork.Relations["Duty<->Mercenaries"] = -800;

  fork.Relations["Mercenaries<->FreeStalkers"] = -800;
  fork.Relations["FreeStalkers<->Mercenaries"] = -800;
  fork.Relations["Mercenaries<->Militaries"] = -800;
  fork.Relations["Militaries<->Mercenaries"] = -800;
  fork.Relations["Mercenaries<->Spark"] = 0;
  fork.Relations["Spark<->Mercenaries"] = 0;

  fork.Relations["Mercenaries<->Varta"] = 0;
  fork.Relations["Varta<->Mercenaries"] = 0;

  fork.Relations["Freedom<->Duty"] = -800;
  fork.Relations["Duty<->Freedom"] = -800;

  fork.Relations["Varta<->Spark"] = -800;
  fork.Relations["Spark<->Varta"] = -800;

  return fork;
};

transformRelationPrototypes.files = ["/RelationPrototypes.cfg"];
