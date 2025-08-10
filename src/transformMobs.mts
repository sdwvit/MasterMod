import { GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mts";

/**
 * Sets bullet (Strike) protection to 0 for all mobs.
 */
export const transformMobs: Meta["entriesTransformer"] = (entries: ObjectPrototype["entries"]) => {
  if (!entries.Protection || !entries.Protection.entries) {
    return null;
  }
  entries.Protection.entries = { Strike: 0.0001 }; // Set Strike protection to 0 for all mobs
  return { Protection: entries.Protection };
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
type ObjectPrototype = GetStructType<{ SID: string; Protection: { Strike: number } }>;
