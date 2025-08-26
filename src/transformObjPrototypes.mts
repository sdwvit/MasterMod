import { GetStructType, ObjPrototype, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Prevents NPCs from being knocked down.
 * Also removes Fall damage.
 * @param entries
 */
export const transformObjPrototypes: Meta["entriesTransformer"] = (entries: ObjPrototype["entries"]) => {
  if (entries.SID === "NPCBase" || entries.SID === "Player") {
    class Protection extends Struct<{ Fall: number }> {
      _id: string = "Protection";
      entries = { Fall: 100 };
    }

    return { CanBeKnockedDown: false, Protection: new Protection() };
  }
  return null;
};
