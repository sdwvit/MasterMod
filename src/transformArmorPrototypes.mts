import { ArmorPrototype, Struct } from "s2cfgtojson";
import { Meta, WithSID } from "./prepare-configs.mjs";
import { allDefaultArmorDefs, allExtraArmors, backfillArmorDef, newHeadlessArmors } from "./armors.util.mjs";
import path from "node:path";
import { logger } from "./logger.mjs";
import dotEnv from "dotenv";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const oncePerFile = new Set<string>();

/**
 * Adds armor that doesn't block head, but also removes any psy protection. Allows player to use helmets.
 */
export const transformArmorPrototypes: Meta["entriesTransformer"] = (entries: ArmorPrototype["entries"], context) => {
  if (entries.SID.toLowerCase().includes("helmet") || bannedids.has(entries.SID)) {
    return null;
  }

  if (!oncePerFile.has(context.filePath)) {
    allExtraArmors.forEach(([original, newSID]) => {
      if (!context.structsById[original]) {
        return;
      }
      const armor = allDefaultArmorDefs[original];
      if (armor) {
        const newArmor = new (Struct.createDynamicClass(newSID))() as ArmorPrototype & WithSID;
        newArmor.entries = { SID: newSID } as ArmorPrototype["entries"];
        newArmor.refkey = original;
        newArmor.refurl = context.struct.refurl;
        if (!newArmor.refurl) {
          logger.warn(`No refurl for ${context.filePath}`);
          return;
        }
        newArmor._id = newSID;
        newArmor.isRoot = true;
        if (newHeadlessArmors[newSID]) {
          backfillArmorDef(newArmor);
          newArmor.entries.UpgradePrototypeSIDs.entries = Object.fromEntries(
            Object.entries(newArmor.entries.UpgradePrototypeSIDs).filter(([_, v]) => v !== "FaustPsyResist_Quest_1_1"),
          );
          newArmor.entries.bBlockHead = false;
        } else {
          newArmor.entries.Invisible = true;
          newArmor.entries.ItemGridWidth = 1;
          newArmor.entries.ItemGridHeight = 1;
        }
        context.extraStructs.push(newArmor);
      }
      oncePerFile.add(context.filePath);
    });
  }

  return null;
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
