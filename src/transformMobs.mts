import { MutantBase } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mts";
import Pseudogiant from "../GameLite/GameData/ObjPrototypes/Pseudogiant.cfg";

/**
 * Sets bullet (Strike) protection to 0 for all mobs.
 */
export const transformMobs: Meta["entriesTransformer"] = (entries: MutantBase["entries"]) => {
  if (!entries.Protection || !entries.Protection.entries) {
    return null;
  }
  if (entries.SID === ("Pseudogiant" as Pseudogiant.Config<MutantBase>["entries"]["SID"])) {
    entries.VitalParams.entries = { MaxHP: entries.VitalParams.entries.MaxHP * 2 } as any;
  }
  entries.Protection.entries = { Strike: 0.0001 } as any; // Set Strike protection to 0 for all mobs
  return { Protection: entries.Protection, VitalParams: entries.VitalParams };
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
