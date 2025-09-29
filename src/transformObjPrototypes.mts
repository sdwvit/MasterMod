import { GetStructType, ObjPrototype, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Prevents NPCs from being knocked down.
 * Also removes Fall damage.
 * @param entries
 */
export const transformObjPrototypes: Meta<ObjPrototype>["entriesTransformer"] = (entries: ObjPrototype) => {
  if (entries.SID === "NPCBase" || entries.SID === "Player") {
    return new Struct({ CanBeKnockedDown: false, Protection: new Protection() });
  }
  return null;
};

class Protection extends Struct {
  _id: string = "Protection";
  Fall = 100;
}
