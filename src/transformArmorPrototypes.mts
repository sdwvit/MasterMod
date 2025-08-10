import { GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

type ArmorPrototype = { _refkey: string | number } & GetStructType<{
  SID: string;
  Icon: string;
  MeshPrototypeSID: string;
  BaseDurability: number;
  Weight: number;
  bBlockHead?: boolean;
  Cost: number;
  ArtifactSlots: number;
  Protection: {
    Burn: number;
    Shock: number;
    ChemicalBurn: number;
    Radiation: number;
    PSY: number;
    Strike: number;
    Fall: number;
  };
  ProtectionNPC: any;
  UpgradePrototypeSIDs: string[];
  SectionSettings: any;
  MeshGenerator: any;
  NpcMeshGenerator: any;
}>;

/**
 * Makes so no armor blocks head, but also removes any psy protection. Forces player to use helmets.
 */
export const transformArmorPrototypes: Meta["entriesTransformer"] = (entries: ArmorPrototype["entries"], { filePath }) => {
  if (!filePath.includes("ArmorPrototypes.cfg")) {
    return entries;
  }
  if (entries.SID.toLowerCase().includes("helmet") || entries.SID.includes("NPC")) {
    return null;
  }
  let keepo = null;
  if (entries.bBlockHead) {
    keepo ||= { SID: entries.SID };
    keepo.bBlockHead = false;
  }
  if (entries.Protection?.entries.PSY) {
    keepo ||= { SID: entries.SID };
    keepo.Protection = entries.Protection;
    keepo.Protection.entries.PSY = 0;
  }
  return keepo;
};
