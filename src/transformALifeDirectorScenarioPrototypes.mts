import { Meta } from "./prepare-configs.mjs";
import { ALifeDirectorScenarioPrototype, Struct } from "s2cfgtojson";

const MOD_NAME = process.env.MOD_NAME;
/**
 * Transforms ALifeDirectorScenarioPrototypes to adjust NPC limits and spawn parameters.
 */
export const transformALifeDirectorScenarioPrototypes: Meta<ALifeDirectorScenarioPrototype>["entriesTransformer"] = (struct, {}) => {
  const newStruct = struct.fork();

  Object.assign(newStruct, {
    ALifeScenarioNPCArchetypesLimitsPerPlayerRank: struct.ALifeScenarioNPCArchetypesLimitsPerPlayerRank.map(([_k, e]) => {
      const restrictionsRef = e.Restrictions;
      restrictionsRef.addNode(
        new Struct({ AgentType: "EAgentType::Pseudogiant", MaxCount: 1.5, __internal__: { rawName: "_" } }),
        `${MOD_NAME}_Pseudogiant`,
      );
      restrictionsRef.forEach(([_k, e]) => (e.MaxCount *= 2));
      return e;
    }),
    RestrictedObjPrototypeSIDs: struct.RestrictedObjPrototypeSIDs.map(([k, v]) => {
      if (v.startsWith("GeneralNPC_Spark") || v.startsWith("GeneralNPC_Scientists")) {
        struct.RestrictedObjPrototypeSIDs[k] = "GuardNPC_Duty_CloseCombat";
      }
      return v;
    }),
    ProhibitedAgentTypes: struct.ProhibitedAgentTypes.map(([key, v]) => {
      struct.ProhibitedAgentTypes[key] = "EAgentType::RatSwarm";
      return v;
    }),
    Scenarios: struct.Scenarios.map(([_, v]) => {
      if (!v.ExpansionSquadNumMin && !v.ExpansionSquadNumMax) {
        return null;
      }
      const fork = v.fork();
      if (v.ExpansionSquadNumMin) v.ExpansionSquadNumMin *= 2;
      if (v.ExpansionSquadNumMax) v.ExpansionSquadNumMax *= 2;
      return Object.assign(fork, {
        ExpansionSquadNumMin: v.ExpansionSquadNumMin,
        ExpansionSquadNumMax: v.ExpansionSquadNumMax,
      });
    }),
    ScenarioGroups: struct.ScenarioGroups.map(([_, v]) => {
      if (!v.SpawnDelayMin && !v.SpawnDelayMax && !v.PostSpawnDirectorTimeoutMin && !v.PostSpawnDirectorTimeoutMax) {
        return null;
      }
      const fork = v.fork();

      if (v.SpawnDelayMin) v.SpawnDelayMin = Math.ceil(v.SpawnDelayMin / 5);
      if (v.SpawnDelayMax) v.SpawnDelayMax = Math.ceil(v.SpawnDelayMax / 5);
      if (v.PostSpawnDirectorTimeoutMin) v.PostSpawnDirectorTimeoutMin = Math.ceil(v.PostSpawnDirectorTimeoutMin / 5);
      if (v.PostSpawnDirectorTimeoutMax) v.PostSpawnDirectorTimeoutMax = Math.ceil(v.PostSpawnDirectorTimeoutMax / 5);
      return Object.assign(fork, {
        SpawnDelayMin: v.SpawnDelayMin,
        SpawnDelayMax: v.SpawnDelayMax,
        PostSpawnDirectorTimeoutMin: v.PostSpawnDirectorTimeoutMin,
        PostSpawnDirectorTimeoutMax: v.PostSpawnDirectorTimeoutMax,
      });
    }),
  });

  return newStruct;
};
