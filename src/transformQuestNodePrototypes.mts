import { QuestNodePrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { finishedTransformers } from "./meta.mjs";
import { transformSpawnActorPrototypes } from "./transformSpawnActorPrototypes.mjs";
import { waitFor } from "./waitFor.mjs";
import { allStashes } from "./stashes.mjs";
import { modName } from "./base-paths.mjs";
import { questItemSIDs } from "./questItemSIDs.mjs";
import { precision } from "./precision.mjs";
import { getConditions, getLaunchers } from "./struct-utils.mjs";
import { QuestDataTableByQuestSID } from "./rewardFormula.mjs";
import { logger } from "./logger.mjs";

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
    // injectUtilQuestNodes(context);
    promises.push(injectMassiveRNGQuestNodes());
  }

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
  }

  return Promise.all(promises).then((results) => results.flat());
};

const recurringQuestsFilenames = ["BodyParts_Malahit", "RSQ01", "RSQ04", "RSQ05", "RSQ06", "RSQ07", "RSQ08", "RSQ09", "RSQ10"];

transformQuestNodePrototypes._name = "removes timeouts from quest nodes and injects random stash quest nodes";
transformQuestNodePrototypes.files = ["/QuestNodePrototypes/"];
transformQuestNodePrototypes.contents = ["EQuestNodeType::ItemAdd", "EQuestNodeType::SetItemGenerator", "InGameHours"];
transformQuestNodePrototypes.contains = true;

export const getStashSpawnerSID = (stashKey: string) => `${RandomStashQuestNodePrefix}_Random_${stashKey}_Spawn`;

async function injectMassiveRNGQuestNodes() {
  await waitFor(() => finishedTransformers.has(transformSpawnActorPrototypes._name));
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
  await waitFor(() => finishedTransformers.has(transformSpawnActorPrototypes._name));

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

function replaceRewards(struct: QuestNodePrototype) {
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

      if (qv["Spawn NPC Quest Node SID"].trim()) {
        const conditionNode = new Struct() as QuestNodePrototype;
        conditionNode.SID = `${qv["Reward Gen SID"]}_Condition`;
        conditionNode.__internal__.rawName = conditionNode.SID;
        conditionNode.__internal__.isRoot = true;
        conditionNode.NodeType = "EQuestNodeType::Condition";
        conditionNode.QuestSID = struct.QuestSID;
        conditionNode.Conditions = getConditions([
          {
            ConditionType: "EQuestConditionType::Bridge",
            ConditionComparance: "EConditionComparance::Equal",
            LinkedNodePrototypeSID: qv["Spawn NPC Quest Node SID"],
            CompletedNodeLauncherNames: new Struct({ 0: "" }) as any,
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

const getQuestNodeStruct = (itemPrototypeSID: string, startSID: string) => {
  const switchItemState = new Struct(`
      ${RandomStashQuestNodePrefix}_SwitchQuestItemState_${itemPrototypeSID} : struct.begin
         SID = ${RandomStashQuestNodePrefix}_SwitchQuestItemState_${itemPrototypeSID}
         QuestSID = ${RandomStashQuestName}
         NodeType = EQuestNodeType::SwitchQuestItemState
         ItemPrototypeSID = ${itemPrototypeSID}
         QuestItem = false
      struct.end
    `) as QuestNodePrototype;
  switchItemState.Launchers = getLaunchers([{ SID: startSID, Name: "" }]);
  return switchItemState;
};

function injectUtilQuestNodes() {
  const startSID = `${RandomStashQuestNodePrefix}_SwitchQuestItemState_Start`;
  const extraStructs: QuestNodePrototype[] = [];
  extraStructs.push(
    new Struct(`
      ${startSID} : struct.begin
         SID = ${startSID}
         QuestSID = ${RandomStashQuestName}
         NodeType = EQuestNodeType::Technical
         StartDelay = 0 
      struct.end
    `) as QuestNodePrototype,
  );

  questItemSIDs.forEach((questItemSID) => {
    extraStructs.push(getQuestNodeStruct(questItemSID, startSID));
  });
  return extraStructs;
}
