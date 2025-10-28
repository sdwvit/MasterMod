import { QuestNodePrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer, MetaContext } from "./metaType.mjs";
import path from "node:path";
import { finishedTransformers } from "./meta.mjs";
import { transformSpawnActorPrototypes } from "./transformSpawnActorPrototypes.mjs";
import { waitFor } from "./waitFor.mjs";
import { allStashes } from "./stashes.mjs";
import { modName } from "./base-paths.mjs";
import { questItemSIDs } from "./questItemSIDs.mjs";
import { precision } from "./precision.mjs";

let oncePerTransformer = false;
const oncePerFile = new Set<string>();
const RandomStashQuestName = `RandomStashQuest`; // if you change this, also change Blueprint in SDK
const RandomStashQuestNodePrefix = `${modName}_RandomStashQuest`;
/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: EntriesTransformer<QuestNodePrototype> = async (struct, context) => {
  if (struct.InGameHours) {
    return Object.assign(struct.fork(), { InGameHours: 0 });
  }

  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    injectStashClueReward(context);
  }

  if (!oncePerTransformer) {
    oncePerTransformer = true;
    injectUtilQuestNodes(context);
    await injectMassiveRNGQuestNodes(context);
  }
};

// RSQ07_C06_B_A_SetItemGenerator_Player
const launchers = new Set([
  "E03_SQ01_C1",
  "RSQ01_C03",
  "RSQ01_C01",
  "RSQ04_C01",
  "RSQ01_C02",
  "RSQ01_C04",
  "RSQ04_C02",
  "RSQ04_C03",
  "RSQ01_C05",
  "RSQ04_C04",
  "RSQ01_C06",
  "RSQ04_C07",
  "RSQ04_C05",
  "RSQ04_C08",
  "RSQ04_C06",
  "RSQ04_C09",
  "RSQ05_C01",
  "RSQ05_C04",
  "RSQ04_C10",
  "RSQ05_C08",
  "RSQ05_C02",
  "RSQ05_C05",
  "RSQ05_C07",
  "RSQ05_C09",
  "RSQ05_C10",
  "RSQ06_C01___K_Z",
  "RSQ06_C02___K_M",
  "RSQ06_C05___B_B",
  "RSQ06_C06___B_A",
  "RSQ06_C07___B_A",
  "RSQ06_C08___B_A",
  "RSQ06_C03___K_B",
  "RSQ06_C09___S_P",
  "RSQ07_C01_K_Z",
  "RSQ06_C04___K_S",
  "RSQ07_C05_B_B",
  "RSQ07_C02_K_M",
  "RSQ07_C04_K_B",
  "RSQ07_C06_B_A",
  "RSQ07_C07_B_A",
  "RSQ07_C03_K_M",
  "RSQ07_C08_B_A",
  "RSQ07_C09_S_P",
  "RSQ08_C04_B_B",
  "RSQ08_C01_K_M",
  "RSQ08_C02_K_B",
  "RSQ08_C05_B_B",
  "RSQ08_C06_B_A",
  "RSQ08_C03_K_S",
  "RSQ08_C08_B_A",
  "RSQ08_C07_B_A",
  "RSQ08_C09_S_P",
  "RSQ09_C01_K_M",
  "RSQ09_C05_B_B",
  "RSQ09_C02_K_M",
  "RSQ09_C07_B_A",
  "RSQ09_C06_B_A",
  "RSQ09_C08_B_A",
  "RSQ09_C09_S_P",
  "RSQ09_C03_K_M",
  "RSQ09_C04_K_S",
  "RSQ10_C01_K_M",
  "RSQ10_C03_K_S",
  "RSQ10_C05_B_B",
  "RSQ10_C06_B_A",
  "RSQ10_C07_B_A",
  "RSQ10_C08_B_A",
  "RSQ10_C02_K_M",
  "RSQ10_C04_K_S",
  "RSQ10_C09_S_P",
]);
transformQuestNodePrototypes._name = "Remove quest timeouts";
transformQuestNodePrototypes.files = [
  "/QuestNodePrototypes/BodyParts_Malahit.cfg",
  "/QuestNodePrototypes/RSQ01.cfg",
  "/QuestNodePrototypes/RSQ04.cfg",
  "/QuestNodePrototypes/RSQ05.cfg",
  "/QuestNodePrototypes/RSQ06_C00___SIDOROVICH.cfg",
  "/QuestNodePrototypes/RSQ07_C00_TSEMZAVOD.cfg",
  "/QuestNodePrototypes/RSQ08_C00_ROSTOK.cfg",
  "/QuestNodePrototypes/RSQ09_C00_MALAHIT.cfg",
  "/QuestNodePrototypes/RSQ10_C00_HARPY.cfg",
  // for clue generation:
  ...[...launchers].map((e) => `/QuestNodePrototypes/${e}.cfg`),
];

const getLaunchers = (sids: string[], name: string): any => {
  return new Struct(Object.fromEntries(sids.map((sid, i) => [i, { Excluding: false, Connections: { 0: { SID: sid, Name: name } } }])));
};

async function injectMassiveRNGQuestNodes(context: MetaContext<QuestNodePrototype>) {
  await waitFor(() => finishedTransformers.has(transformSpawnActorPrototypes._name));

  const stashes = Object.keys(allStashes);
  const randomNode = new Struct(`
    ${RandomStashQuestNodePrefix}_Random : struct.begin
        SID = ${RandomStashQuestNodePrefix}_Random
        QuestSID = ${RandomStashQuestName}
        NodeType = EQuestNodeType::Random
    struct.end`) as QuestNodePrototype;
  context.extraStructs.push(randomNode);
  stashes.forEach((key, i) => {
    randomNode.OutputPinNames ||= new Struct() as any;
    randomNode.OutputPinNames.addNode(i);
    randomNode.PinWeights ||= new Struct() as any;
    randomNode.PinWeights.addNode(precision(1 - (i + 1) / stashes.length, 1e6));

    const spawnerSID = `${RandomStashQuestNodePrefix}_Random_${i}_Spawn`;
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
    spawner.Launchers = getLaunchers([`${RandomStashQuestNodePrefix}_Random`], String(i)) as any;

    context.extraStructs.push(spawner);
    const cacheNotif = new Struct(`
        ${RandomStashQuestNodePrefix}_Random_${i} : struct.begin
           SID = ${RandomStashQuestNodePrefix}_Random_${i}
           QuestSID = ${RandomStashQuestName}
           NodeType = EQuestNodeType::GiveCache
           TargetQuestGuid = ${key}
        struct.end
      `) as QuestNodePrototype;
    cacheNotif.Launchers = getLaunchers([`${RandomStashQuestNodePrefix}_Random`], String(i)) as any;

    context.extraStructs.push(cacheNotif);

    const tpSkif = new Struct(`
        ${RandomStashQuestNodePrefix}_Random_${i}_tp : struct.begin
           SID = ${RandomStashQuestNodePrefix}_Random_${i}_tp
           QuestSID = ${RandomStashQuestName}
           NodeType = EQuestNodeType::TeleportCharacter
           TargetQuestGuid = AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
           TeleportLocationAndRotation : struct.begin
            X = ${allStashes[key].PositionX}
            Y = ${allStashes[key].PositionY}
            Z = ${allStashes[key].PositionZ}
            Pitch = 0.0
            Yaw = 179.999999
            Roll = 0.0
           struct.end
           TeleportType = EGSCTeleportType::None
           ShouldBlendViaFade = false
        struct.end
      `) as QuestNodePrototype;
    context.extraStructs.push(tpSkif);
  });
}

function injectStashClueReward(context: MetaContext<QuestNodePrototype>) {
  const fileName = path.parse(context.filePath).name;
  const hasLauncher = launchers.has(fileName);
  if (!hasLauncher) {
    return;
  }

  const launcher = `${fileName}_SetItemGenerator_Player`;

  /**
   * ConsoleCommand start a quest node for giving a clue.
   */
  context.extraStructs.push(
    new Struct(`
      ${modName}_${fileName}_Give_Cache : struct.begin
         SID = ${modName}_${fileName}_Give_Cache
         QuestSID = ${fileName}
         NodeType = EQuestNodeType::ConsoleCommand
         ConsoleCommand = XStartQuestNodeBySID ${RandomStashQuestNodePrefix}_Random
         Launchers : struct.begin
            [0] : struct.begin
               Excluding = false
               Connections : struct.begin
                  [0] : struct.begin
                     SID = ${launcher}
                     Name =
                  struct.end
               struct.end
            struct.end
         struct.end 
      struct.end
    `) as QuestNodePrototype,
  );
}

function injectUtilQuestNodes(context: MetaContext<QuestNodePrototype>) {
  const startSID = `${RandomStashQuestNodePrefix}_SwitchQuestItemState_Start`;
  const getQuestNodeStruct = (itemPrototypeSID: string) =>
    new Struct(`
      ${RandomStashQuestNodePrefix}_SwitchQuestItemState_${itemPrototypeSID} : struct.begin
         SID = ${RandomStashQuestNodePrefix}_SwitchQuestItemState_${itemPrototypeSID}
         QuestSID = ${RandomStashQuestName}
         NodeType = EQuestNodeType::SwitchQuestItemState
         Launchers : struct.begin
            [0] : struct.begin
               Excluding = false
               Connections : struct.begin
                  [0] : struct.begin
                     SID = ${startSID}
                     Name =
                  struct.end
               struct.end
            struct.end
         struct.end
         ItemPrototypeSID = ${itemPrototypeSID}
         QuestItem = false
      struct.end
    `) as QuestNodePrototype;

  context.extraStructs.push(
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
    context.extraStructs.push(getQuestNodeStruct(questItemSID));
  });
}
