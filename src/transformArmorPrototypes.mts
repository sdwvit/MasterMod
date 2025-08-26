import { ArmorPrototype, Struct } from "s2cfgtojson";
import { Meta, WithSID } from "./prepare-configs.mjs";
import { extraArmors, newHeadlessArmors } from "./extraArmors.mjs";
import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger.mjs";
import dotEnv from "dotenv";
import { deepMerge } from "./deepMerge.mjs";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const oncePerFile = new Set<string>();

const nestedDir = path.join("Stalker2", "Content", "GameLite");
const BASE_CFG_DIR = path.join(process.env.SDK_PATH, nestedDir);
const allArmorDefs = Object.fromEntries(
  (
    Struct.fromString(
      [
        fs.readFileSync(path.join(BASE_CFG_DIR, "GameData", "ItemPrototypes", "ArmorPrototypes.cfg"), "utf8"),
        fs.readFileSync(path.join(BASE_CFG_DIR, "DLCGameData", "Deluxe", "ItemPrototypes", "ArmorPrototypes.cfg"), "utf8"),
        fs.readFileSync(path.join(BASE_CFG_DIR, "DLCGameData", "PreOrder", "ItemPrototypes", "ArmorPrototypes.cfg"), "utf8"),
        fs.readFileSync(path.join(BASE_CFG_DIR, "DLCGameData", "Ultimate", "ItemPrototypes", "ArmorPrototypes.cfg"), "utf8"),
      ].join("\n"),
    ) as ArmorPrototype[]
  ).map((e) => [e.entries.SID, e] as const),
);
const d = deepMerge;
/**
 * Makes so no armor blocks head, but also removes any psy protection. Forces player to use helmets.
 */
export const transformArmorPrototypes: Meta["entriesTransformer"] = (entries: ArmorPrototype["entries"], context) => {
  if (entries.SID.toLowerCase().includes("helmet") || bannedids.has(entries.SID)) {
    return null;
  }

  if (!oncePerFile.has(context.filePath)) {
    extraArmors.forEach(([original, newSID]) => {
      if (!context.structsById[original]) {
        return;
      }
      const armor = allArmorDefs[original];
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
          newArmor.entries = { ...newArmor.entries, ...newHeadlessArmors[newSID as keyof typeof newHeadlessArmors].entries };
          let t = armor;
          while (!t.entries.Protection) {
            t = allArmorDefs[t.refkey];
          }

          newArmor.entries.Protection = t.entries.Protection;
          newArmor.entries.Protection.entries.PSY = 0;
          t = armor;
          while (!t.entries.UpgradePrototypeSIDs) {
            t = allArmorDefs[t.refkey];
          }

          newArmor.entries.UpgradePrototypeSIDs = t.entries.UpgradePrototypeSIDs;
          newArmor.entries.UpgradePrototypeSIDs.entries = Object.fromEntries(
            Object.entries(t.entries.UpgradePrototypeSIDs.entries).filter(([_, v]) => v !== "FaustPsyResist_Quest_1_1"),
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
