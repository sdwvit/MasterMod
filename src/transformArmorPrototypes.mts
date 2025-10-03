import { ArmorPrototype, Struct } from "s2cfgtojson";
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
export const transformArmorPrototypes: Meta<ArmorPrototype>["entriesTransformer"] = (struct, context) => {
  if (bannedids.has(struct.SID)) {
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

      const newArmor = new Struct({
        SID: newSID,
        __internal__: { rawName: newSID, refkey: original, refurl: struct.__internal__.refurl },
      }) as ArmorPrototype;
      backfillArmorDef(newArmor);
      const overrides = { ...newArmors[newSID as keyof typeof newArmors] };
      if (overrides.__internal__?._extras && "keysForRemoval" in overrides.__internal__._extras) {
        Object.entries(overrides.__internal__._extras.keysForRemoval).forEach(([p, v]) => {
          const e = get(newArmor, p) || {};
          const keyToDelete = Object.keys(e).find((k) => e[k] === v) || v;
          delete e[keyToDelete];
        });
        delete overrides.__internal__._extras;
      }
      deepMerge(newArmor, overrides);
      if (!newArmors[newSID]) {
        newArmor.Invisible = true;
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
