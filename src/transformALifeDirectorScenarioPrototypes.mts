import { Meta } from "./prepare-configs.mjs";
import { ALifeDirectorScenarioPrototype, EAgentType, GetStructType, Struct } from "s2cfgtojson";

/**
 * Transforms ALifeDirectorScenarioPrototypes to adjust NPC limits and spawn parameters.
 */
export const transformALifeDirectorScenarioPrototypes: Meta["entriesTransformer"] = (entries: ALifeDirectorScenarioPrototype["entries"], {}) => {
  Object.values(entries.ALifeScenarioNPCArchetypesLimitsPerPlayerRank.entries || {})
    .filter((e) => e.entries)
    .forEach((e) => {
      const restrictionsRef = e.entries.Restrictions;
      const pseudogiant = new (Struct.createDynamicClass("_"))() as GetStructType<Restriction>;
      pseudogiant.entries = {
        AgentType: "EAgentType::Pseudogiant",
        MaxCount: 1.5, // going to be doubled later in code
      };
      const nextIndex =
        parseInt(
          Object.keys(restrictionsRef.entries || {})
            .filter((e) => parseInt(e))
            .pop() || "-1",
        ) + 1;
      Struct.addEntry(restrictionsRef, "[*]", pseudogiant, nextIndex);
      Object.values(restrictionsRef.entries || {})
        .filter((e) => e.entries)
        .forEach((e) => {
          e.entries.MaxCount *= 2;
        });
    });
  entries.RestrictedObjPrototypeSIDs.entries = Object.fromEntries(
    Object.entries(entries.RestrictedObjPrototypeSIDs.entries || {})
      .filter((e) => e[1].startsWith)
      .filter((e) => e[1].startsWith("GeneralNPC"))
      .map((e) => [e[0], "GuardNPC_Duty_CloseCombat"]),
  );
  entries.ProhibitedAgentTypes.entries = Object.fromEntries(
    Object.entries(entries.ProhibitedAgentTypes.entries || {}).map((e) => [e[0], "EAgentType::RatSwarm"]),
  );
  Object.values(entries.Scenarios.entries || {}).forEach((e) => {
    if (e.entries.ExpansionSquadNumMin) e.entries.ExpansionSquadNumMin *= 2;
    if (e.entries.ExpansionSquadNumMax) e.entries.ExpansionSquadNumMax *= 2;
  });
  Object.values(entries.ScenarioGroups.entries || {}).forEach((e) => {
    if (e.entries.SpawnDelayMin) e.entries.SpawnDelayMin = Math.ceil(e.entries.SpawnDelayMin / 5);
    if (e.entries.SpawnDelayMax) e.entries.SpawnDelayMax = Math.ceil(e.entries.SpawnDelayMax / 5);
    if (e.entries.PostSpawnDirectorTimeoutMin) e.entries.PostSpawnDirectorTimeoutMin = Math.ceil(e.entries.PostSpawnDirectorTimeoutMin / 5);
    if (e.entries.PostSpawnDirectorTimeoutMax) e.entries.PostSpawnDirectorTimeoutMax = Math.ceil(e.entries.PostSpawnDirectorTimeoutMax / 5);
  });
  return entries;
};
type Restriction = {
  AgentType: EAgentType;
  MaxCount: number;
};
