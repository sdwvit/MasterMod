import { StashPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";

export const transformStashPrototypes: Meta<StashPrototype>["entriesTransformer"] = (entries, { index }) => {
  if (entries.SID === "empty") {
    return null;
  }
  let newEntries: StashPrototype | null = null;
  Object.values(entries.ItemGenerators)
    .filter((e) => e)
    .forEach((e) => {
      Object.values<(typeof e.SmartLootParams.ConsumablesParams)[number]>((e?.SmartLootParams?.ConsumablesParams || {}) as any)
        .filter((e) => e)
        .forEach((ie) => {
          ie.MinSpawnChance = 0;
          if (ie.ItemSetCount) ie.ItemSetCount = 1;
          while (ie.MaxSpawnChance > 0.2) ie.MaxSpawnChance /= Math.floor(semiRandom(index) * 8) + 2;
          ie.MaxSpawnChance = parseFloat(ie.MaxSpawnChance.toFixed(3));
          Object.values(ie.Items || {}).forEach((item) => {
            if (item) {
              if (item.MinCount) item.MinCount = 1;
              if (item.MaxCount) item.MaxCount = 1;
            }
          });
          newEntries = entries;
        });
    });

  return newEntries;
};
