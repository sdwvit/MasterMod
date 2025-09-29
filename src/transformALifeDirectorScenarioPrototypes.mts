import { Meta } from "./prepare-configs.mjs";
import { ALifeDirectorScenarioPrototype, createDynamicClassInstance } from "s2cfgtojson";

/**
 * Transforms ALifeDirectorScenarioPrototypes to adjust NPC limits and spawn parameters.
 */
export const transformALifeDirectorScenarioPrototypes: Meta<ALifeDirectorScenarioPrototype>["entriesTransformer"] = (struct, {}) => {
  Object.values<(typeof struct.ALifeScenarioNPCArchetypesLimitsPerPlayerRank)[number]>(
    (struct.ALifeScenarioNPCArchetypesLimitsPerPlayerRank || {}) as any,
  )
    .filter((e) => e)
    .forEach((e) => {
      const pseudogiant = createDynamicClassInstance("_") as (typeof e.Restrictions)[number];
      pseudogiant.AgentType = "EAgentType::Pseudogiant";
      pseudogiant.MaxCount = 1.5; // going to be doubled later in code

      const restrictionsRef = e.Restrictions;
      const nextIndex =
        parseInt(
          Object.keys(restrictionsRef)
            .filter((e) => parseInt(e))
            .pop() || "-1",
        ) + 1;
      restrictionsRef[nextIndex] = pseudogiant;
      Object.values(restrictionsRef)
        .filter((e) => e)
        .forEach((e) => {
          e.MaxCount *= 2;
        });
    });
  Object.entries(struct.RestrictedObjPrototypeSIDs).forEach((e) => {
    if (e[1].startsWith && e[1].startsWith("GeneralNPC")) {
      struct.RestrictedObjPrototypeSIDs[e[0]] = "GuardNPC_Duty_CloseCombat";
    }
  });
  Object.entries(struct.ProhibitedAgentTypes).forEach((e) => {
    struct.ProhibitedAgentTypes[e[0]] = "EAgentType::RatSwarm";
  });
  Object.values(struct.Scenarios.entries || {}).forEach((e) => {
    if (e.entries.ExpansionSquadNumMin) e.entries.ExpansionSquadNumMin *= 2;
    if (e.entries.ExpansionSquadNumMax) e.entries.ExpansionSquadNumMax *= 2;
  });
  Object.values(struct.ScenarioGroups.entries || {}).forEach((e) => {
    if (e.entries.SpawnDelayMin) e.entries.SpawnDelayMin = Math.ceil(e.entries.SpawnDelayMin / 5);
    if (e.entries.SpawnDelayMax) e.entries.SpawnDelayMax = Math.ceil(e.entries.SpawnDelayMax / 5);
    if (e.entries.PostSpawnDirectorTimeoutMin) e.entries.PostSpawnDirectorTimeoutMin = Math.ceil(e.entries.PostSpawnDirectorTimeoutMin / 5);
    if (e.entries.PostSpawnDirectorTimeoutMax) e.entries.PostSpawnDirectorTimeoutMax = Math.ceil(e.entries.PostSpawnDirectorTimeoutMax / 5);
  });
  return struct;
};
