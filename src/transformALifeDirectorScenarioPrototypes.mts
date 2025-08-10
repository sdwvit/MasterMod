import { Meta } from "./prepare-configs.mjs";
import { EAgentArchetype, EAgentType, EALifeDirectorScenarioTarget, ERank, GetStructType } from "s2cfgtojson";

/**
 * Transforms ALifeDirectorScenarioPrototypes to adjust NPC limits and spawn parameters.
 */
export const transformALifeDirectorScenarioPrototypes: Meta["entriesTransformer"] = (
  entries: ALifeDirectorScenarioPrototypes["entries"],
  { filePath },
) => {
  if (!filePath.includes("ALifeDirectorScenarioPrototypes.cfg")) {
    return entries;
  }
  Object.values(entries.ALifeScenarioNPCArchetypesLimitsPerPlayerRank.entries || {})
    .filter((e) => e.entries)
    .forEach((e) => {
      Object.values(e.entries.Restrictions.entries || {})
        .filter((e) => e.entries)
        .forEach((e) => {
          e.entries.MaxCount = e.entries.MaxCount > 1 ? e.entries.MaxCount * 2 : 2;
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

type ALifeDirectorScenarioPrototypes = GetStructType<{
  SID: string;
  DefaultSpawnDelayMin: number;
  DefaultSpawnDelayMax: number;
  DefaultPostSpawnDirectorTimeoutMin: number;
  DefaultPostSpawnDirectorTimeoutMax: number;
  DefaultALifeLairExpansionToPlayerTimeMin: number;
  DefaultALifeLairExpansionToPlayerTimeMax: number;
  DefaultExpansionSquadNumMin: number;
  DefaultExpansionSquadNumMax: number;
  DefaultShouldDespawnNPCs: true;
  DefaultEmissionScenarioGroup: string;
  DefaultScenarioGroup: string;
  DefaultEmptyScenarioGroup: string;
  FallbackMaxSpawnCount: number;
  ALifeScenarioNPCArchetypesLimitsPerPlayerRank: {
    Rank: ERank;
    Restrictions: {
      AgentType: EAgentType;
      MaxCount: number;
    }[];
  }[];
  RestrictedObjPrototypeSIDs: string[];
  ProhibitedAgentTypes: EAgentType[];
  FallbackNPCTypes: string[];
  Scenarios: Record<
    string,
    {
      SID: string;
      PlayerRequiredRank: ERank;
      ScenarioSquads: {
        AgentArchetype?: EAgentArchetype;
        AgentPrototypeSID?: string;
        bPlayerEnemy: boolean;
        RelationGroup: number;
        AliveMultiplierMin: number;
        AliveMultiplierMax: number;
        WoundedMultiplier: number;
        DeadMultiplier: number;
      }[];
      ScenarioGroupsTarget: EALifeDirectorScenarioTarget;
      ExpansionSquadNumMin?: number;
      ExpansionSquadNumMax?: number;
    }
  >;
  ScenarioGroups: Record<
    string,
    {
      SID: string;
      ScenarioSIDs: Record<string, { ScenarioWeight: number }>;
      SpawnDelayMin: number;
      SpawnDelayMax: number;
      PostSpawnDirectorTimeoutMin: number;
      PostSpawnDirectorTimeoutMax: number;
    }
  >;
}>;
