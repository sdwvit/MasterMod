import { MutantBase } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mts";

/**
 * Sets bullet (Strike) protection to 0 for all mobs.
 */
export const transformMobs: Meta<MutantBase>["entriesTransformer"] = (struct) => {
  if (!struct.Protection) {
    return null;
  }
  const fork = struct.fork();
  if (struct.SID === "Pseudogiant") {
    fork.VitalParams = Object.assign(struct.VitalParams.fork(), { MaxHP: struct.VitalParams.MaxHP * 2 });
  }
  fork.Protection = Object.assign(struct.Protection.fork(), { Strike: 0.0001 }); // Set Strike protection to 0 for all mobs
  return fork;
};

export const mobs = [
  "BlindDog.cfg",
  "Bloodsucker.cfg",
  "Boar.cfg",
  "Burer.cfg",
  "Cat.cfg",
  "Chimera.cfg",
  "Controller.cfg",
  "Deer.cfg",
  "Flesh.cfg",
  "MutantBase.cfg",
  "Poltergeist.cfg",
  "PseudoDog.cfg",
  "Pseudogiant.cfg",
  "Snork.cfg",
  "Tushkan.cfg",
];
