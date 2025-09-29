import { ArmorPrototype, createDynamicClassInstance } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { allDefaultArmorDefs, allExtraArmors, backfillArmorDef, newArmors } from "./armors.util.mjs";
import path from "node:path";
import { logger } from "./logger.mjs";
import dotEnv from "dotenv";
import { deepMerge } from "./deepMerge.mjs";

const get = (obj: any, path: `${string}.${string}` | string) => {
  return path.split(".").reduce((o, i) => (o || {})[i], obj);
};

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const oncePerFile = new Set<string>();

/**
 * Adds armor that doesn't block head, but also removes any psy protection. Allows player to use helmets.
 */
export const transformArmorPrototypes: Meta<ArmorPrototype>["entriesTransformer"] = (entries, context) => {
  if (entries.SID.toLowerCase().includes("helmet") || bannedids.has(entries.SID)) {
    return null;
  }

  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    allExtraArmors.forEach((descriptor) => {
      const original = descriptor.__internal__.refkey;
      const newSID = descriptor.SID;
      if (!context.structsById[original]) {
        return;
      }
      const armor = allDefaultArmorDefs[original];
      if (!armor) {
        return;
      }

      const newArmor = createDynamicClassInstance("_") as ArmorPrototype;
      newArmor.SID = newSID;
      newArmor.__internal__.refkey = original;
      newArmor.__internal__.refurl = entries.__internal__.refurl;
      if (!newArmor.__internal__.refurl) {
        logger.warn(`No refurl for ${context.filePath}`);
        return;
      }
      newArmor.__internal__.rawName = newSID;
      if (newArmors[newSID]) {
        backfillArmorDef(newArmor);
        const overrides = { ...newArmors[newSID] };
        if (overrides._extras?.keysForRemoval) {
          Object.keys(overrides._extras.keysForRemoval).forEach((p) => {
            const e = get(newArmor, p) || {};
            const key = Object.keys(e).find((k) => e[k] === overrides._extras.keysForRemoval[p]) || overrides._extras.keysForRemoval[p];
            delete e[key];
          });
          delete overrides._extras;
        }
        deepMerge(newArmor, overrides);
      } else {
        newArmor.Invisible = true;
        newArmor.ItemGridWidth = 1;
        newArmor.ItemGridHeight = 1;
      }
      context.extraStructs.push(newArmor.clone());
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
