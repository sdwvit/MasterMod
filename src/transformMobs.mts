import { MutantBase } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";

/**
 * Sets bullet (Strike) protection to 0 for all mobs.
 */
export const transformMobs: EntriesTransformer<MutantBase> = async (struct) => {
  if (!struct.Protection) {
    return null;
  }
  const fork = struct.fork();
  if (struct.SID !== "Rat" && struct.SID !== "MutantBase" && struct.SID !== "Tushkan" && struct.SID !== "Bayun" && struct.SID !== "Blinddog") {
    fork.VitalParams = Object.assign(struct.VitalParams.fork(), { MaxHP: struct.VitalParams.MaxHP * DIFFICULTY_FACTOR });
  }
  fork.Protection = Object.assign(struct.Protection.fork(), { Strike: 0.0001 }); // Set Strike protection to 0 for all mobs
  return fork;
};

transformMobs.files = [
  "/BlindDog.cfg",
  "/Bloodsucker.cfg",
  "/Boar.cfg",
  "/Burer.cfg",
  "/Cat.cfg",
  "/Chimera.cfg",
  "/Controller.cfg",
  "/Deer.cfg",
  "/Flesh.cfg",
  "/MutantBase.cfg",
  "/Poltergeist.cfg",
  "/PseudoDog.cfg",
  "/Pseudogiant.cfg",
  "/Snork.cfg",
  "/Tushkan.cfg",
];
transformMobs._name = "Set bullet (Strike) protection to 0 for all mobs";
