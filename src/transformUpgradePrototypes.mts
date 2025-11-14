import { UpgradePrototype } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";

/**
 * Unlocks blocking upgrades.
 */
export const transformUpgradePrototypes: EntriesTransformer<UpgradePrototype> = async (struct) => {
  if (struct.SID === "empty") {
    return Object.assign(struct.fork(), {
      RepairCostModifier: `0.02f`,
    });
  }
  const fork = struct.fork();
  if (struct.BlockingUpgradePrototypeSIDs?.entries().length) {
    Object.assign(fork, {
      BlockingUpgradePrototypeSIDs: struct.BlockingUpgradePrototypeSIDs.map(() => "empty"),
    });
    fork.BlockingUpgradePrototypeSIDs.__internal__.bpatch = true;
  }
  if (struct.InterchangeableUpgradePrototypeSIDs?.entries().length /*&& !struct.AttachPrototypeSIDs?.entries().length*/) {
    Object.assign(fork, {
      InterchangeableUpgradePrototypeSIDs: struct.InterchangeableUpgradePrototypeSIDs.map(() => "empty"),
    });
    fork.InterchangeableUpgradePrototypeSIDs.__internal__.bpatch = true;
  }
  if (fork.entries().length) {
    return fork;
  }
};
transformUpgradePrototypes._name = "Unlock blocking upgrades";
transformUpgradePrototypes.files = ["/UpgradePrototypes.cfg"];
