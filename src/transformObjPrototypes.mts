import { GetStructType, ObjPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";

/**
 * Prevents NPCs from being knocked down.
 * Also removes Fall damage.
 * @param struct
 */
export const transformObjPrototypes: EntriesTransformer<ObjPrototype> = (struct) => {
  if (struct.SID === "NPCBase" || struct.SID === "Player") {
    return Object.assign(struct.fork(), {
      CanBeKnockedDown: false,
      Protection: Object.assign(struct.Protection?.fork() || new Struct().fork(), { Fall: 100 }),
    });
  }
};
transformObjPrototypes.files = ["/GameData/ObjPrototypes.cfg", "/ObjPrototypes/GeneralNPCObjPrototypes.cfg"];
transformObjPrototypes._name = "Prevent NPCs from being knocked down";
