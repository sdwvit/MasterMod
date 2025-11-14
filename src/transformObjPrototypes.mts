import { ObjPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";

/**
 * Prevents NPCs from being knocked down.
 * Also removes Fall damage.
 * @param struct
 */
export const transformObjPrototypes: EntriesTransformer<ObjPrototype> = async (struct) => {
  const fork = struct.fork();
  if (struct.ShouldGenerateStashClues) {
    fork.ShouldGenerateStashClues = false;
  }
  if (struct.SID === "NPCBase") {
    Object.assign(fork, {
      CanBeKnockedDown: false,
      Protection: Object.assign(struct.Protection?.fork() || new Struct().fork(), { Fall: 100 }),
    });
  }
  if (struct.SID === "Player") {
    fork.WaterContactInfo = struct.WaterContactInfo.fork();
    fork.WaterContactInfo.SingleCurveEffects = struct.WaterContactInfo.SingleCurveEffects.fork(true).map(
      () => Object.assign(new Struct(), { EffectSID: "empty" }) as any,
    );
    fork.WaterContactInfo.DualCurveEffects = struct.WaterContactInfo.DualCurveEffects.fork(true).map(
      () => Object.assign(new Struct(), { EffectSID: "empty" }) as any,
    );
    Object.assign(fork, {
      CanBeKnockedDown: false,
      Protection: Object.assign(struct.Protection?.fork() || new Struct().fork(), { Fall: 100 }),
    });
  }

  if (fork.entries().length) {
    return fork;
  }
};
transformObjPrototypes.files = ["/GameData/ObjPrototypes.cfg", "/ObjPrototypes/GeneralNPCObjPrototypes.cfg"];
