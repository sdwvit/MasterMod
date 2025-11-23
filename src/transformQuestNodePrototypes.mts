import { QuestNodePrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { finishedTransformers } from "./meta.mjs";
import { transformSpawnActorPrototypes } from "./transformSpawnActorPrototypes.mjs";
import { waitFor } from "./waitFor.mjs";
import { allStashes } from "./stashes.mjs";
import { modName } from "./base-paths.mjs";
import { precision } from "./precision.mjs";
import { getConditions, getLaunchers } from "./struct-utils.mjs";
import { QuestDataTableByQuestSID } from "./rewardFormula.mjs";
import { logger } from "./logger.mjs";
import { markAsForkRecursively } from "./markAsForkRecursively.mjs";
import { deepMerge } from "./deepMerge.mjs";
import { RSQLessThan3QuestNodesSIDs, RSQRandomizerQuestNodesSIDs, RSQSetDialogQuestNodesSIDs } from "./consts.mjs";

let oncePerTransformer = false;
const RandomStashQuestName = `RandomStashQuest`; // if you change this, also change Blueprint in SDK
const RandomStashQuestNodePrefix = `${modName}_RandomStashQuest`;
/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: EntriesTransformer<QuestNodePrototype> = async (struct, context) => {
  let promises: Promise<QuestNodePrototype[] | QuestNodePrototype>[] = [];
  // applies to all quest nodes that add items (i.e., stash clues)
  if (struct.NodeType === "EQuestNodeType::ItemAdd") {
    promises.push(hookStashSpawners(struct));
  }

  if (!oncePerTransformer) {
    oncePerTransformer = true;
    promises.push(injectMassiveRNGQuestNodes());
  }

  /*if (struct.SID === "RookieVillage_Hub_OnNPCCreateEvent_BP_NPC_RookieVillageGuider") {
    promises.push(
      Promise.resolve(
        new Struct({
          __internal__: {
            isRoot: true,
            rawName: "RookieVillage_Hub_Exchange_Armor_SetDialog",
          },
          SID: "RookieVillage_Hub_Exchange_Armor_SetDialog",
          Repeatable: true,
          QuestSID: "RookieVillage_Hub",
          NodeType: "EQuestNodeType::SetDialog",
          Launchers: getLaunchers([{ SID: "RookieVillage_Hub_OnNPCCreateEvent_BP_NPC_RookieVillageGuider", Name: "" }]),
          LastPhrases: new Struct({ 0: new Struct({ FinishNode: false, LastPhraseSID: "RookieVillage_Hub_Exchange_Armor_SetDialog_1" }) }),
          DialogChainPrototypeSID: "RookieVillage_Hub_Exchange_Armor_SetDialog",
          DialogMembers: new Struct({ 0: "927B9C2A43F721EC11E6C486D0DDFA0F" }),
          TalkThroughRadio: new Struct({ 0: false }),
          DialogObjectLocation: new Struct({ 0: new Struct({ X: 0.0, Y: 0.0, Z: 0.0 }) }),
          NPCToStartDialog: -1,
          StartForcedDialog: false,
          WaitAllDialogEndingsToFinish: false,
          IsComment: false,
          OverrideDialogTopic: "EOverrideDialogTopic::None" as EOverrideDialogTopic,
          CanExitAnytime: false,
          ContinueThroughRadio: false,
          CallPlayer: false,
          SeekPlayer: false,
          CallPlayerRadius: 1000.0,
        }) as QuestNodePrototype,
      ),
    );
  }*/

  // applies only to recurring quests
  if (recurringQuestsFilenames.some((p) => context.filePath.includes(p))) {
    if (struct.NodeType === "EQuestNodeType::SetItemGenerator") {
      if (struct.ItemGeneratorSID.includes("reward_var")) {
        promises.push(Promise.resolve(hookRewardStashClue(struct)));
        promises.push(Promise.resolve(replaceRewards(struct)));
      }
    }

    if (struct.InGameHours) {
      promises.push(Promise.resolve(Object.assign(struct.fork(), { InGameHours: 0 })));
    }

    if (struct.SID === "RSQ08_C01_K_M_Random_3") {
      promises.push(Promise.resolve(Object.assign(struct.fork(), { PinWeights: Object.assign(struct.PinWeights.fork(), { 0: 0.5 }) })));
    }
    if (struct.SID === "RSQ08_C01_K_M_Technical_STL4939_Pin_0") {
      const newConditions = Object.assign(struct.fork(), {
        Conditions: getConditions([
          {
            ConditionType: "EQuestConditionType::NodeState",
            ConditionComparance: "EConditionComparance::Equal",
            TargetNode: "RSQ08_C01_K_M_SetDialog_RSQ08_Dialog_Barmen_C01_Finish",
            NodeState: "EQuestNodeState::Finished",
          },
        ]),
      });
      newConditions.Conditions.__internal__.bpatch = false;
      promises.push(Promise.resolve(newConditions));
    }

    if (RSQLessThan3QuestNodesSIDs.has(struct.SID)) {
      const total = context.structsById[RSQRandomizerQuestNodesSIDs.find((key) => !!context.structsById[key])].OutputPinNames.entries().length;
      promises.push(
        Promise.resolve(
          markAsForkRecursively(
            deepMerge(struct.fork(), {
              Conditions: new Struct({
                // as of 1.7 all of them are [0][0]
                0: new Struct({
                  0: new Struct({ VariableValue: total }),
                }),
              }),
            }),
          ),
        ),
      );
    }
    if (RSQSetDialogQuestNodesSIDs.has(struct.SID)) {
      let connectionIndex: string;
      const [launcherIndex] = struct.Launchers.entries().find((e) => {
        return e[1].Connections.entries().find((e1) => {
          connectionIndex = e1[0];
          return RSQLessThan3QuestNodesSIDs.has(e1[1].SID);
        });
      });
      const fork = markAsForkRecursively(
        deepMerge(struct.fork(), {
          Launchers: new Struct({
            [launcherIndex]: new Struct({
              Connections: new Struct({
                [connectionIndex]: new Struct({
                  Name: "True",
                }),
              }),
            }),
          }),
        }),
      );
      promises.push(Promise.resolve(fork));
    }
  }

  return Promise.all(promises).then((results) => results.flat());
};

const recurringQuestsFilenames = ["BodyParts_Malahit", "RSQ01", "RSQ04", "RSQ05", "RSQ06", "RSQ07", "RSQ08", "RSQ09", "RSQ10"];

transformQuestNodePrototypes.files = ["/QuestNodePrototypes/"];
transformQuestNodePrototypes.contents = [
  "EQuestNodeType::ItemAdd",
  "EQuestNodeType::SetItemGenerator",
  "InGameHours",
  "RookieVillage_Hub_OnNPCCreateEvent_BP_NPC_RookieVillageGuider",
];
transformQuestNodePrototypes.contains = true;

export const getStashSpawnerSID = (stashKey: string) => `${RandomStashQuestNodePrefix}_Random_${stashKey}_Spawn`;

async function injectMassiveRNGQuestNodes() {
  await waitFor(() => finishedTransformers.has(transformSpawnActorPrototypes.name));
  const extraStructs: QuestNodePrototype[] = [];
  const stashes = Object.keys(allStashes);
  const randomNode = new Struct(`
    ${RandomStashQuestNodePrefix}_Random : struct.begin
        SID = ${RandomStashQuestNodePrefix}_Random
        QuestSID = ${RandomStashQuestName}
        NodeType = EQuestNodeType::Random
    struct.end`) as QuestNodePrototype;
  extraStructs.push(randomNode);
  stashes.forEach((key, i) => {
    randomNode.OutputPinNames ||= new Struct() as any;
    randomNode.OutputPinNames.addNode(i);
    randomNode.PinWeights ||= new Struct() as any;
    randomNode.PinWeights.addNode(precision(1 - (i + 1) / stashes.length, 1e6));

    const spawnerSID = getStashSpawnerSID(key);
    const spawner = new Struct(`
      ${spawnerSID} : struct.begin
         SID = ${spawnerSID}
         QuestSID = ${RandomStashQuestName}
         NodeType = EQuestNodeType::Spawn
         TargetQuestGuid = ${key}
         IgnoreDamageType = EIgnoreDamageType::None
         SpawnHidden = false
         SpawnNodeExcludeType = ESpawnNodeExcludeType::SeamlessDespawn
      struct.end
    `) as QuestNodePrototype;
    const launcherConfig = [{ SID: `${RandomStashQuestNodePrefix}_Random`, Name: String(i) }];
    spawner.Launchers = getLaunchers(launcherConfig);

    extraStructs.push(spawner);
    const cacheNotif = new Struct(`
        ${RandomStashQuestNodePrefix}_Random_${i} : struct.begin
           SID = ${RandomStashQuestNodePrefix}_Random_${i}
           QuestSID = ${RandomStashQuestName}
           NodeType = EQuestNodeType::GiveCache
           TargetQuestGuid = ${key}
        struct.end
      `) as QuestNodePrototype;
    cacheNotif.Launchers = getLaunchers([{ SID: `${RandomStashQuestNodePrefix}_Random`, Name: String(i) }]);

    extraStructs.push(cacheNotif);
  });
  return extraStructs;
}

/**
 * ConsoleCommand start a quest node for giving a clue.
 */
function hookRewardStashClue(struct: QuestNodePrototype) {
  const stashClueReward = new Struct(`
      ${struct.SID}_Give_Cache : struct.begin
         SID = ${struct.SID}_Give_Cache
         QuestSID = ${struct.QuestSID}
         NodeType = EQuestNodeType::ConsoleCommand
         ConsoleCommand = XStartQuestNodeBySID ${RandomStashQuestNodePrefix}_Random
      struct.end
    `) as QuestNodePrototype;

  stashClueReward.Launchers = getLaunchers([{ SID: struct.SID, Name: "" }]);
  return stashClueReward;
}

async function hookStashSpawners(struct: QuestNodePrototype) {
  await waitFor(() => finishedTransformers.has(transformSpawnActorPrototypes.name));

  // only quest stashes that are hidden by this mod are interesting here
  if (!allStashes[struct.TargetQuestGuid]) {
    return;
  }

  const spawnStash = struct.fork();
  spawnStash.SID = `${struct.QuestSID}_Spawn_${struct.TargetQuestGuid}`;
  spawnStash.NodeType = "EQuestNodeType::ConsoleCommand";
  spawnStash.QuestSID = struct.QuestSID;
  spawnStash.ConsoleCommand = `XStartQuestNodeBySID ${getStashSpawnerSID(struct.TargetQuestGuid)}`;
  spawnStash.Launchers = struct.Launchers;
  const fork = struct.fork();
  fork.Launchers = getLaunchers([{ SID: spawnStash.SID, Name: "" }]);
  spawnStash.__internal__.rawName = spawnStash.SID;
  delete spawnStash.__internal__.bpatch;
  delete spawnStash.__internal__.refurl;
  delete spawnStash.__internal__.refkey;
  return [spawnStash, fork];
}

const oncePerQuestSID = new Set<string>();

function replaceRewards(structR: Struct) {
  const struct = structR as QuestNodePrototype;
  const extraStructs: QuestNodePrototype[] = [];

  if (!oncePerQuestSID.has(struct.QuestSID)) {
    oncePerQuestSID.add(struct.QuestSID);
    logger.info(`Replacing rewards for quest SID: ${struct.QuestSID}`);
    const questVariants = QuestDataTableByQuestSID[struct.QuestSID];
    questVariants.forEach((qv) => {
      const newRewardNode = struct.fork(true);
      delete newRewardNode.__internal__.bpatch;
      delete newRewardNode.__internal__.refurl;
      newRewardNode.SID = `${qv["Reward Gen SID"]}_SetItemGenerator`;
      newRewardNode.__internal__.rawName = newRewardNode.SID;
      newRewardNode.ItemGeneratorSID = qv["Reward Gen SID"];
      newRewardNode.QuestSID = struct.QuestSID;
      newRewardNode.Launchers = getLaunchers([{ SID: struct.SID, Name: "" }]);
      extraStructs.push(newRewardNode);

      if (qv["Variant Quest Node SID"].trim()) {
        const varName = `${qv.Vendor.replace(/\W/g, "")}_latest_quest_variant`;
        const setLatestQuestVarNode = new Struct({
          SID: `Set_${varName}_${qv["#"]}`,
          QuestSID: struct.QuestSID,
          NodeType: "EQuestNodeType::SetGlobalVariable",
          GlobalVariablePrototypeSID: varName,
          ChangeValueMode: "EChangeValueMode::Set",
          VariableValue: qv["#"],
          Launchers: getLaunchers([{ SID: qv["Variant Quest Node SID"].trim(), Name: "" }]),
        }) as QuestNodePrototype;
        setLatestQuestVarNode.__internal__.rawName = setLatestQuestVarNode.SID;
        setLatestQuestVarNode.__internal__.isRoot = true;
        extraStructs.push(setLatestQuestVarNode);

        const conditionNode = new Struct() as QuestNodePrototype;
        conditionNode.SID = `${qv["Reward Gen SID"]}_Condition`;
        conditionNode.__internal__.rawName = conditionNode.SID;
        conditionNode.__internal__.isRoot = true;
        conditionNode.NodeType = "EQuestNodeType::Condition";
        conditionNode.QuestSID = struct.QuestSID;
        conditionNode.Conditions = getConditions([
          {
            ConditionType: "EQuestConditionType::GlobalVariable",
            ConditionComparance: "EConditionComparance::Equal",
            GlobalVariablePrototypeSID: varName,
            ChangeValueMode: "EChangeValueMode::Set",
            VariableValue: qv["#"],
          },
        ]);
        conditionNode.Launchers = getLaunchers([{ SID: struct.SID, Name: "" }]);
        newRewardNode.Launchers = getLaunchers([{ SID: conditionNode.SID, Name: "" }]);
        extraStructs.push(conditionNode);
      }
    });
  }
  extraStructs.push(Object.assign(struct.fork(), { ItemGeneratorSID: "empty" }));
  return extraStructs;
}
