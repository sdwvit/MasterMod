import { GetStructType, Struct } from "s2cfgtojson";
import { Meta, WithSID } from "./prepare-configs.mjs";
import { extraArmors } from "./extraArmors.mjs";

type ArmorPrototype = GetStructType<{
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
  Invisible?: boolean;
}>;

const oncePerFile = new Set<string>();

/**
 * Makes so no armor blocks head, but also removes any psy protection. Forces player to use helmets.
 */
export const transformArmorPrototypes: Meta["entriesTransformer"] = (entries: ArmorPrototype["entries"], context) => {
  if (entries.SID.toLowerCase().includes("helmet") || bannedids.has(entries.SID)) {
    return null;
  }

  if (!oncePerFile.has(context.filePath)) {
    // add extra spark armor
    extraArmors.forEach(([original, newSID]) => {
      const armor = context.array.find((a) => a.entries.SID === original) as unknown as ArmorPrototype | undefined;
      if (armor) {
        const newArmor = new (Struct.createDynamicClass(newSID))() as ArmorPrototype & WithSID;
        newArmor.entries = {
          SID: newSID,
          Invisible: true,
        } as ArmorPrototype["entries"];
        newArmor.refkey = original;
        newArmor.refurl = armor.refurl;
        newArmor._id = newSID;
        newArmor.isRoot = true;
        context.extraStructs.push(newArmor);
      }
      oncePerFile.add(context.filePath);
    });
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

const bannedids = new Set([
  "NPC_Richter_Armor",
  "NPC_Korshunov_Armor",
  "NPC_Korshunov_Armor_2",
  "NPC_Dalin_Armor",
  "NPC_Agata_Armor",
  "NPC_Faust_Armor",
  "NPC_Kaymanov_Armor",
  "NPC_Shram_Armor",
  "NPC_Dekhtyarev_Armor",
  "NPC_Sidorovich_Armor",
  "NPC_Barmen_Armor",
  "NPC_Batya_Armor",
  "NPC_Tyotya_Armor",
]);
