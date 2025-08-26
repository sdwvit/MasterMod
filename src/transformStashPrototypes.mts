import { StashPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";

export const transformStashPrototypes: Meta["entriesTransformer"] = (entries: StashPrototype["entries"], { index }) => {
  if (entries.SID === "empty") {
    return null;
  }
  let newEntries: StashPrototype["entries"] | null = null;
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
