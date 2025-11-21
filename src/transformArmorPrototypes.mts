import { ArmorPrototype, Struct } from "s2cfgtojson";
import { deepMerge } from "./deepMerge.mjs";

import { EntriesTransformer } from "./metaType.mjs";
import path from "node:path";
import { backfillArmorDef } from "./backfillArmorDef.mjs";
import { allDefaultArmorDefs } from "./consts.mjs";
import { allExtraArmors, newArmors } from "./armors.util.mjs";

const get = (obj: any, path: `${string}.${string}` | string) => {
  return path.split(".").reduce((o, i) => (o || {})[i], obj);
};

const oncePerFile = new Set<string>();

/**
 * Adds armor that doesn't block head, but also removes any psy protection. Allows player to use helmets.
 */
export const transformArmorPrototypes: EntriesTransformer<ArmorPrototype> = async (struct, context) => {
  if (bannedids.has(struct.SID)) {
    return null;
  }
  const extraStructs: ArmorPrototype[] = [];

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

      const newArmor = new Struct(
        backfillArmorDef({
          SID: newSID,
          __internal__: { rawName: newSID, refkey: original, refurl: `../${path.parse(context.filePath).base}` },
        }),
      ) as ArmorPrototype;
      const overrides = { ...newArmors[newSID as keyof typeof newArmors] };
      if (overrides.__internal__?._extras && "keysForRemoval" in overrides.__internal__._extras) {
        Object.entries(overrides.__internal__._extras.keysForRemoval).forEach(([p, v]) => {
          const e = get(newArmor, p) || {};
          if (!Array.isArray(v)) {
            throw new Error("Expected array for keysForRemoval values");
          }
          const keysV = new Set(v);
          const keyToDelete = Object.keys(e).find((k) => keysV.has(e[k]));

          delete e[keyToDelete];
        });
      }
      deepMerge(newArmor, overrides);
      if (!newArmors[newSID] || !newArmors[newSID].__internal__._extras.isDroppable) {
        newArmor.Invisible = true;
      }
      extraStructs.push(newArmor.clone());
    });
  }

  return extraStructs;
};
transformArmorPrototypes.files = ["/ArmorPrototypes.cfg"];

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
