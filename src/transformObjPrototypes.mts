import { GetStructType, ObjPrototype, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Prevents NPCs from being knocked down.
 * Also removes Fall damage.
 * @param struct
 */
export const transformObjPrototypes: Meta<ObjPrototype>["entriesTransformer"] = (struct) => {
  if (struct.SID === "NPCBase" || struct.SID === "Player") {
    return Object.assign(struct.fork(), {
      CanBeKnockedDown: false,
      Protection: Object.assign(struct.Protection?.fork() || new Struct().fork(), { Fall: 100 }),
    });
  }
};
