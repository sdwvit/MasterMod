import { ERank, GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

export type StashPrototypesType = GetStructType<{
  SID: string;
  ItemGenerators: {
    Rank: ERank;
    SmartLootParams: {
      ConsumablesParams: {
        ItemSetCount: number;
        MinSpawnChance: number;
        MaxSpawnChance: number;
        Items: {
          ItemPrototypeSID: string;
          MinCount: number;
          MaxCount: number;
          Weight: number;
        }[];
      }[];
    };
  }[];
}>;

export function transformStashPrototypes(
  entries: StashPrototypesType["entries"],
  c: Parameters<Meta["entriesTransformer"]>[1],
) {
  if (!c.file.includes("/StashPrototypes.cfg")) {
    return entries;
  }
  if (entries.SID === "empty") {
    return null;
  }
  let keep = false;
  Object.values(entries.ItemGenerators.entries)
    .filter((e) => e.entries)
    .forEach((e) => {
      Object.values(e.entries?.SmartLootParams.entries?.ConsumablesParams?.entries || {})
        .filter((e) => e.entries)
        .forEach((ie) => {
          ie.entries.MinSpawnChance = 0;
          keep = true;
          while (ie.entries.MaxSpawnChance > 0.1) ie.entries.MaxSpawnChance /= 10;
          ie.entries.MaxSpawnChance = parseFloat(ie.entries.MaxSpawnChance.toFixed(3));
        });
    });

  return keep ? entries : null;
}
