import { ERank, GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";

type StashPrototypesType = GetStructType<{
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

export const transformStashPrototypes: Meta["entriesTransformer"] = (entries: StashPrototypesType["entries"], { index }) => {
  if (entries.SID === "empty") {
    return null;
  }
  let newEntries: StashPrototypesType["entries"] | null = null;
  Object.values(entries.ItemGenerators.entries)
    .filter((e) => e.entries)
    .forEach((e) => {
      Object.values(e.entries?.SmartLootParams.entries?.ConsumablesParams?.entries || {})
        .filter((e) => e.entries)
        .forEach((ie) => {
          ie.entries.MinSpawnChance = 0;
          if (ie.entries.ItemSetCount) ie.entries.ItemSetCount = 1;
          while (ie.entries.MaxSpawnChance > 0.2) ie.entries.MaxSpawnChance /= Math.floor(semiRandom(index) * 8) + 2;
          ie.entries.MaxSpawnChance = parseFloat(ie.entries.MaxSpawnChance.toFixed(3));
          Object.values(ie.entries.Items.entries || {}).forEach((item) => {
            if (item.entries) {
              if (item.entries.MinCount) item.entries.MinCount = 1;
              if (item.entries.MaxCount) item.entries.MaxCount = 1;
            }
          });
          newEntries = entries;
        });
    });

  return newEntries;
};
