import { GetStructType, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Prevents NPCs from being knocked down.
 * Also removes Fall damage.
 * @param entries
 * @param file
 */
export const transformObjPrototypes: Meta["entriesTransformer"] = (entries: ObjPrototypes["entries"], { filePath }) => {
  if (
    !filePath.includes("GameData/ObjPrototypes.cfg") &&
    !filePath.includes("ObjPrototypes/GeneralNPCObjPrototypes.cfg")
  ) {
    return entries;
  }
  if (entries.SID === "NPCBase" || entries.SID === "Player") {
    class Protection extends Struct<{ Fall: number }> {
      _id: string = "Protection";
      entries = { Fall: 100 };
    }

    return { CanBeKnockedDown: false, Protection: new Protection() };
  }
  return null;
};
export type ObjPrototypes = GetStructType<{
  CanBeKnockedDown: boolean;
  SID: string;
  Protection: { Fall: number };
}>;
