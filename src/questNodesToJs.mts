import { MetaContext } from "./metaType.mjs";
import { GetStructType, QuestNodePrototype, SpawnActorPrototype, Struct } from "s2cfgtojson";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
import { writeFileSync } from "node:fs";
import { onL1Finish } from "./l1-cache.mjs";
import { allDefaultArtifactPrototypes, allDefaultQuestItemPrototypes } from "./consts.mjs";

const EVENTS = [
  "OnAbilityEndedEvent",
  "OnAbilityUsedEvent",
  "OnDialogStartEvent",
  "OnEmissionFinishEvent",
  "OnEmissionStageActivated",
  "OnEmissionStageFinished",
  "OnEmissionStartEvent",
  "OnFactionBecomeEnemyEvent",
  "OnFactionBecomeFriendEvent",
  "OnGetCompatibleAttachEvent",
  "OnHitEvent",
  "OnInfotopicFinishEvent",
  "OnInteractEvent",
  "OnJournalQuestEvent",
  "OnKillerCheckEvent",
  "OnMoneyAmountReachedEvent",
  "OnNPCDeathEvent",
  "OnTickEvent",
  "OnNPCBecomeEnemyEvent",
  "OnNPCBecomeFriendEvent",
  "OnNPCCreateEvent",
  "OnNPCDefeatEvent",
  "OnPlayerGetItemEvent",
  "OnPlayerLostItemEvent",
  "OnPlayerNoticedEvent",
  "OnSignalReceived",
];

const EVENTS_INTERESTING_PROPS = new Set(["ExpectedItemsCount", "ItemsCount"]);
const EVENTS_INTERESTING_SIDS = new Set(["TargetQuestGuid", "ItemPrototypeSID", "ItemSID", "SignalSenderGuid", "ContaineredQuestPrototypeSID"]);

export async function questNodesToJs(context: MetaContext<Struct>) {
  const contextT = context as MetaContext<
    QuestNodePrototype & {
      LaunchersBySID: GetStructType<Record<string, { SID: string; Name: string }[]>>;
      Launches: { SID: string; Name: string }[];
    }
  >;
  const globalVars = new Set<string>();
  const globalFunctions = new Map<string, string>();
  const questActors = new Set<string>();
  const launchOnQuestStart = [];
  questActors.add("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"); // Skif

  const content = getContent(context, globalVars, globalFunctions, questActors, launchOnQuestStart);

  return `
  const intervals = [];
  const Skif = 'Skif';
  const spawnedActors = {};
  const questActors = ${await getQuestActorsStr(questActors)}
  ${hasQuestNodeExecuted.toString()}
  ${waitForCallers.toString()}
  ${[...globalVars]
    .filter((v) => v && !contextT.structsById[v])
    .map((v) => `let ${v} = '${v}';`)
    .join("\n")}
  ${[...globalFunctions]
    .filter(([v]) => v && !contextT.structsById[v])
    .map(([v, i]) =>
      i
        ? `const ${v} = ${i}`
        : `const ${v} = (...args) => { console.log('${v}(', typeof args[0] === 'function' ? args[0].name + ', ' + args.slice(1).join(', ') : args, ');'); return '${v}'; }`,
    )
    .join("\n")}
  ${content}
  setTimeout(() => {
    intervals.forEach(i => clearInterval(i));
  }, 1500);
  ${launchOnQuestStart.map((sid) => `${sid}('QuestStart');`).join("\n")}
  `;
}

function questNodeToJavascript(structr: Struct, globalVars: Set<string>, globalFunctions: Map<string, string>, questActors: Set<string>): string {
  const struct = structr as QuestNodePrototype;
  const subType = struct.NodeType.split("::").pop();

  // noinspection FallThroughInSwitchStatementJS
  switch (subType) {
    case "ActivateRestrictor":
      globalFunctions.set("activateRestrictor", "");
      return `activateRestrictor('${struct.VolumeGuid}');`;

    case "ChangeRelationships":
      globalFunctions.set("setFactionRelationship", "");
      globalFunctions.set("addFactionRelationship", "");

      questActors.add(struct.FirstTargetSID);
      return `${struct.UseDeltaValue ? "add" : "set"}FactionRelationship(questActors['${struct.FirstTargetSID}'], '${struct.SecondTargetSID}',  ${struct.RelationshipValue});`;

    case "If":
    case "Condition":
      return processConditionNode(struct, globalVars, globalFunctions, questActors);

    case "Despawn":
      questActors.add(struct.TargetQuestGuid);
      globalFunctions.set("despawn", "(actor) => { delete spawnedActors[actor]; console.log(`despawn(\${actor})`); }; ");
      return `despawn(questActors['${struct.TargetQuestGuid}']);`;
    case "End":
      return "";
    case "OnAbilityEndedEvent":
    case "OnAbilityUsedEvent":
    case "OnDialogStartEvent":
    case "OnEmissionFinishEvent":
    case "OnEmissionStageActivated":
    case "OnEmissionStageFinished":
    case "OnEmissionStartEvent":
    case "OnFactionBecomeEnemyEvent":
    case "OnFactionBecomeFriendEvent":
    case "OnGetCompatibleAttachEvent":
    case "OnHitEvent":
    case "OnInfotopicFinishEvent":
    case "OnInteractEvent":
    case "OnJournalQuestEvent":
    case "OnKillerCheckEvent":
    case "OnMoneyAmountReachedEvent":
    case "OnNPCDeathEvent":
    case "OnNPCBecomeEnemyEvent":
    case "OnNPCBecomeFriendEvent":
    case "OnNPCCreateEvent":
    case "OnNPCDefeatEvent":
    case "OnPlayerGetItemEvent":
    case "OnPlayerLostItemEvent":
    case "OnPlayerNoticedEvent":
      globalFunctions.set(subType, "");
      return "";

    case "ConsoleCommand":
    case "LookAt":
    case "ALifeDirectorZoneSwitch":
    case "AchievementUnlock":
    case "ActivateAnomaly":
    case "ActivateInteractableObject":
    case "AddNote":
    case "AddOrRemoveFromSquad":
    case "AddTechnicianSkillOrUpgrade":
    case "BridgeCleanUp":
    case "BridgeEvent":
    case "CancelAllSideQuests":
    case "ChangeFaction":
    case "DeactivateZone":
    case "PlayEffect":
    case "PlayPostProcess":
    case "PlaySound":
    case "PlayVideo":
    case "ProtectLairNPCSquadItem":
    case "ReputationLocker":
    case "ResetAI":
    case "RestrictSave":
    case "RestrictionArea":
    case "SaveGame":
    case "ScheduledContainer":
    case "SearchPoint":
    case "SendSignal":
    case "SequenceStart":
    case "SetCharacterEffect":
    case "SetCharacterParam":
    case "SetDurabilityParam":
    case "SetFactionRestriction":
    case "SetHubOwner":
    case "SetMeshGenerator":
    case "SetNPCSequentialAbility":
    case "SetName":
    case "SetPersonalRestriction":
    case "SetQuestGiver":
    case "SetSpaceRestrictor":
    case "SetTime":
    case "SetTimer":
    case "SetWeather":
    case "SetWounded":
    case "ShowFadeScreen":
    case "ShowLoadingScreen":
    case "ShowMarker":
    case "ShowTutorialWidget":
    case "TeleportCharacter":
    case "TimeLock":
    case "ToggleLairActivity":
    case "ToggleNPCHidden":
    case "TrackJournal":
    case "TrackShelter":
    case "Trigger":
    case "DisableNPCBark":
    case "DisableNPCInteraction":
    case "EmissionScheduleControl":
    case "EmissionStart":
    case "EnableDataLayer":
    case "EquipItemInHands":
    case "FlashlightOnOff":
    case "ForceInteract":
    case "GiveCache":
    case "HideLoadingScreen":
    case "HideTutorial":
    case "ItemAdd":
    case "ItemRemove":
    case "LoadAsset":
    case "MoveInventory":
    case "NPCBark":
    case "SwitchQuestItemState":
    case "OnSignalReceived":
    case "SpawnAnomaly":
    case "SpawnAnomalySpawner":
    case "SpawnArtifactSpawner":
    case "SpawnDeadBody":
    case "SpawnItemContainer":
    case "SpawnLair":
    case "SpawnSafeZone":
    case "SpawnSingleObj":
    case "SpawnSquad":
    case "SpawnTrigger":
      globalFunctions.set(subType, "");
      return `${subType}(${struct
        .entries()
        .map(([k]) => {
          if (EVENTS_INTERESTING_SIDS.has(k)) {
            questActors.add(struct[k]);
            return `questActors['${struct[k]}']`;
          }

          if (EVENTS_INTERESTING_PROPS.has(k)) {
            return struct[k];
          }

          return "";
        })
        .filter((k) => k)});`;

    case "Container":
      globalFunctions.set(subType, "");
      return `const result = ${subType}(${struct
        .entries()
        .map(([k]) => {
          if (EVENTS_INTERESTING_SIDS.has(k)) {
            questActors.add(struct[k]);
            return `questActors['${struct[k]}']`;
          }

          if (EVENTS_INTERESTING_PROPS.has(k)) {
            return struct[k];
          }

          return "";
        })
        .filter((k) => k)});`;
    case "OnTickEvent":
      globalFunctions.set(
        "OnTickEvent",
        "(fn, target) => { console.log(`OnTickEvent('${target ?? ''}', () => ${fn.name}())`); intervals.push(setInterval(fn, 200)) };",
      );
      return "";

    case "Random":
      return `const result = (() => { 
      const rand = Math.random();
      ${struct.PinWeights.entries()
        .map(([_k, weight], i) => `if (rand >= ${weight}) return '${struct.OutputPinNames?.[i] ?? "impossible"}'`)
        .join("\nelse ")}
        })();`;

    case "SetAIBehavior":
      globalFunctions.set("setAIBehavior", "");
      return `setAIBehavior('${struct.TargetQuestGuid}', '${struct.BehaviorType.split("::").pop()}');`;

    case "SetDialog":
      globalFunctions.set("setDialog", "");
      globalVars.add(struct.DialogChainPrototypeSID);

      return `const result = setDialog(${struct.DialogChainPrototypeSID}, [ ${struct.LastPhrases.entries().map(([_k, lp]) => {
        globalVars.add(lp.LastPhraseSID);
        globalVars.add("finish");
        globalVars.add(lp.NextLaunchedPhraseSID);
        return `${lp.LastPhraseSID} ${lp.NextLaunchedPhraseSID ? ", " + lp.NextLaunchedPhraseSID : ""} ${lp.FinishNode ? ", finish" : ""}`;
      })}]);`;

    case "SetGlobalVariable":
      globalVars.add(struct.GlobalVariablePrototypeSID);
      let op = "=";
      switch (struct.ChangeValueMode) {
        case "EChangeValueMode::Add":
          op = "+=";
          break;
        case "EChangeValueMode::Subtract":
          op = "-=";
          break;
        case "EChangeValueMode::Set":
          op = "=";
          break;
      }
      op = `${struct.GlobalVariablePrototypeSID} ${op} ${struct.VariableValue};`;
      return `console.log('${op}');\n${op}`.trim();

    case "SetItemGenerator":
      globalFunctions.set("setItemGenerator", "");
      globalVars.add(struct.ItemGeneratorSID);
      questActors.add(struct.TargetQuestGuid);
      return `setItemGenerator(questActors['${struct.TargetQuestGuid}'], ${struct.ItemGeneratorSID});`;

    case "SetJournal":
      globalFunctions.set("setJournal", "");
      globalVars.add(struct.JournalQuestSID);
      const setJrn = `setJournal(${struct.JournalQuestSID}, '${struct.JournalAction.split("::").pop()}'`;
      switch (struct.JournalEntity) {
        case "EJournalEntity::Quest":
          return `${setJrn});`;
        case "EJournalEntity::QuestStage":
          return `${setJrn}${struct.StageID ? ", " + struct.StageID : ""} );`;
      }

    case "Spawn":
      globalFunctions.set("spawn", "(actor) => { spawnedActors[actor] = true; console.log(`spawn(\${questActors[actor]});`); return actor; }; //");
      questActors.add(struct.TargetQuestGuid);
      return `spawn('${struct.TargetQuestGuid}', { ignoreDamageType: '${struct.IgnoreDamageType}', spawnHidden: ${struct.SpawnHidden}, spawnNodeExcludeType: '${struct.SpawnNodeExcludeType}' });`;
    case "Technical":
      return "";
  }
  return "";
}

function getConditionComparance(ConditionComparance: string) {
  const subType = ConditionComparance.split("::").pop();
  switch (subType) {
    case "Equal":
      return "===";
    case "Greater":
      return ">";
    case "GreaterOrEqual":
      return ">=";
    case "Less":
      return "<";
    case "LessOrEqual":
      return "<=";
    case "NotEqual":
      return "!==";
  }
}

function waitForCallers(
  timeout: number,
  struct: {
    State: any;
    Conditions: { [x: string]: any };
    name: any;
  },
  caller: string | number,
) {
  return new Promise((resolve: (_: void) => void, reject: (r: string) => void) => {
    const state = struct.State;
    const conditions = Object.values(struct.Conditions[caller] ?? {});
    const to = setTimeout(() => {
      clearInterval(interval);
      reject(
        "Timeout waiting for condition(s):\n\t" +
          conditions
            .map(({ SID, Name }) => (state[SID] === (Name || true) ? "" : `${struct.name} to be called by ${SID} ${Name ? "with " + Name : ""}`))
            .filter((r) => !!r)
            .join("\n\t"),
      );
    }, timeout);

    const interval = setInterval(() => {
      if (conditions.every(({ SID, Name }) => state[SID] === (Name || true))) {
        clearTimeout(to);
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

function hasQuestNodeExecuted(fn: { State: {}; name: string }) {
  console.log(`hasQuestNodeExecuted(${fn.name}) is ${fn.State && !!Object.keys(fn.State).length}`);
  return fn.State && !!Object.keys(fn.State).length;
}

function processConditionNode(structT: Struct, globalVars: Set<string>, globalFunctions: Map<string, string>, questActors: Set<string>) {
  const struct = structT as QuestNodePrototype;
  const andOr = struct.Conditions.ConditionCheckType === "EConditionCheckType::Or" ? " || " : " && ";
  const subType = struct.NodeType.split("::").pop();
  return `const result = ${struct.Conditions.entries()
    .filter(([k]) => k !== "ConditionCheckType")
    .map(([_k, cond]) => {
      if (typeof cond === "string") {
        return;
      }
      return cond
        .entries()
        .map(([_k, c]) => {
          const subType = c.ConditionType.split("::").pop();
          switch (subType) {
            case "Weather":
              return 0;
            case "Random":
              return 0;
            case "Trigger":
              return 0;
            case "Emission":
              return 0;
            case "Money":
              return 0;
            case "Rank":
              return 0;
            case "JournalState":
              return 0;
            case "NodeState":
              globalFunctions.set("getQuestNodeState", "");
              globalVars.add(c.TargetNode);
              return `getQuestNodeState(${c.TargetNode}, '${getConditionComparance(c.ConditionComparance)}', '${c.NodeState.split("::").pop()}') ${getConditionComparance(c.ConditionComparance)} '${(() => {
                const st = c.NodeState.split("::").pop();
                switch (st) {
                  case "Activated": // todo extend function state to support these
                  case "Excluded":
                  case "Finished":
                  case "None":
                    return st;
                }
              })()}'`;
            case "Bleeding":
              return 0;
            case "HP":
              return 0;
            case "HPPercent":
              return 0;
            case "HungerPoints":
              return 0;
            case "InventoryWeight":
              return 0;
            case "Radiation":
              return 0;
            case "AITarget":
              return 0;
            case "ArmorState":
              return 0;
            case "Awareness":
              return 0;
            case "Bridge":
              globalFunctions.set(c.LinkedNodePrototypeSID, "");
              c.CompletedNodeLauncherNames.entries().forEach(([_k, v]) => globalVars.add(v));
              return `hasQuestNodeExecuted(${c.LinkedNodePrototypeSID}, [${c.CompletedNodeLauncherNames.entries()
                .map(([_k, v]) => v)
                .join(", ")}]) ${getConditionComparance(c.ConditionComparance)} true`;
            case "ContextualAction":
              return 0;
            case "CorpseCarry":
              return 0;
            case "DistanceToNPC":
              return 0;
            case "DistanceToPoint":
              return 0;
            case "Effect":
              return 0;
            case "EquipmentInHands":
              return 0;
            case "FactionRelationship":
              return 0;
            case "FastTravelMoney":
              return 0;
            case "GlobalVariable":
              globalVars.add(c.GlobalVariablePrototypeSID);
              return `${c.GlobalVariablePrototypeSID} ${getConditionComparance(c.ConditionComparance)} ${c.VariableValue}`;
            case "HasItemInQuickSlot":
              return 0;
            case "IsAlive":
              globalFunctions.set(
                "IsAlive",
                "(actor) => { const isAlive = !!spawnedActors[actor]; console.log(`IsAlive(\${actor}) === \${isAlive}`); return isAlive; };",
              );
              questActors.add(c.TargetCharacter);
              return `${getConditionComparance(c.ConditionComparance) === "===" ? "" : "!"}IsAlive(questActors['${c.TargetCharacter}'])`;

            case "IsCreated":
              globalFunctions.set(
                "IsCreated",
                "(actor) => { const created = !!spawnedActors[actor]; console.log(`IsCreated(\${actor}) === \${created}`); return created; };",
              );
              questActors.add(c.TargetPlaceholder);
              return `${getConditionComparance(c.ConditionComparance) === "===" ? "" : "!"}IsCreated(questActors['${c.TargetPlaceholder}'])`;
            case "IsDialogMemberValid":
              return 0;
            case "IsEnoughAmmo":
              return 0;
            case "IsOnline":
              return 0;
            case "IsWeaponJammed":
              return 0;
            case "IsWounded":
              return 0;
            case "ItemInContainer":
              return 0;
            case "ItemInInventory":
              globalFunctions.set("isItemInInventory", "");
              globalVars.add(c.ItemPrototypeSID.VariableValue);
              return `isItemInInventory(${c.ItemPrototypeSID.VariableValue}) ${getConditionComparance(c.ConditionComparance)} ${c.ItemsCount.VariableValue}`;
            case "LookAtAngle":
              return 0;
            case "Note":
              return 0;
            case "PersonalRelationship":
              return 0;
            case "PlayerOverload":
              return 0;
            case "Psy":
              return 0;
            case "Stamina":
              return 0;
          }
        })
        .join(andOr);
    })
    .join(andOr)} ${subType === "If" ? "" : "; \nif (!result) return"};`;
}

await Promise.all(
  `
RSQ06_C00___SIDOROVICH.cfg
RSQ06_C09___S_P.cfg
RSQ07_C00_TSEMZAVOD.cfg
RSQ08_C00_ROSTOK.cfg
RSQ09_C00_MALAHIT.cfg
RSQ10_C00_HARPY.cfg
RSQ05.cfg
RSQ04.cfg
RSQ01.cfg
  `
    .trim()
    .split("\n")
    .map((f) => f.trim())
    .map(async (filePath) => {
      const context = {
        fileIndex: 0,
        index: 0,
        array: [],
        filePath: "/QuestNodePrototypes/" + filePath,
        structsById: {},
      };

      context.array = await readFileAndGetStructs<QuestNodePrototype>("/QuestNodePrototypes/" + filePath);
      context.structsById = Object.fromEntries(context.array.map((s) => [s.__internal__.rawName, s as QuestNodePrototype]));

      const r = await questNodesToJs(context);
      writeFileSync(`/home/sdwvit/.config/JetBrains/IntelliJIdea2025.1/scratches/${context.array[0].SID}.js`, r);
      // console.log(`\n\nExecuting quest node script for ${filePath}`);
      // await eval(r);
    }),
).then(onL1Finish);

function getEventHandler(eventName: string) {
  return (target: string, content?: string) => `${eventName}(${target}${content ? `, ${content}` : ""});`;
}

function getStructBody(struct: any, globalVars: Set<string>, globalFunctions: Map<string, string>, questActors: Set<string>) {
  let launches = "";
  if (struct.Launches) {
    const useSwitch = struct.Launches.some(({ Name }) => Name);
    if (useSwitch) {
      launches = struct.Launches.map(({ Name, SID }) => {
        const isBool = Name === "True" || Name === "False";
        return `if (${isBool ? (Name === "True" ? "result" : "!result") : `result === "${Name}"`}) ${SID}('${struct.SID}', '${Name || ""}');`;
      }).join("\n");
    } else {
      launches = struct.Launches.map(({ SID, Name }) => `${SID}('${struct.SID}', '${Name || ""}');`).join("\n");
    }
    delete struct.Launches;
  }
  const atLeastSomeLaunchersAreCodependent =
    struct.LaunchersBySID && struct.LaunchersBySID.entries().length && struct.LaunchersBySID.entries().some(([_k, v]) => v.entries().length > 1);
  const consoleLog = `console.log('// ${struct.SID}(${atLeastSomeLaunchersAreCodependent ? "', caller, ',', name, '" : ""});');`;
  return `
     function ${struct.SID}(caller, name) {         
         ${struct.SID}.Conditions ??= ${JSON.stringify(struct.LaunchersBySID, (key, value) => (key === "__internal__" ? undefined : value)) || "{}"}
         ${struct.SID}.State ??= {};
         ${struct.SID}.State[caller] = name || true;
         ${atLeastSomeLaunchersAreCodependent ? "" : consoleLog}
         ${atLeastSomeLaunchersAreCodependent ? `waitForCallers(1000, ${struct.SID}, caller).then(() => {` : ""}
           ${questNodeToJavascript(struct, globalVars, globalFunctions, questActors)}
           ${launches}
           ${atLeastSomeLaunchersAreCodependent ? consoleLog : ""}
         ${atLeastSomeLaunchersAreCodependent ? "}).catch(e => console.log(e))" : ""} 
     }
    `.trim();
}

async function getQuestActorsStr(questActors: Set<string>) {
  const relevantStructs = await Promise.all(
    [...questActors]
      .filter((e) => e !== "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
      .map(async (SID) => {
        let res: SpawnActorPrototype;
        try {
          const structs = await readFileAndGetStructs<SpawnActorPrototype>(`${SID}.cfg`);
          return structs[0] || ({ SID } as SpawnActorPrototype);
        } catch (e) {
          res =
            allDefaultQuestItemPrototypes.find((s) => s.SID === SID) ||
            allDefaultArtifactPrototypes.find((s) => s.SID === SID) ||
            ({ SID } as SpawnActorPrototype);
          if (res) {
            return res;
          }
          console.warn(`Quest actor prototype not found: ${SID}.cfg`);
          return { SID };
        }
      }),
  );
  return JSON.stringify(
    Object.fromEntries(
      [["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "Skif"]].concat(
        relevantStructs.map((sap: SpawnActorPrototype) => {
          sap ||= {} as SpawnActorPrototype;
          const pos = sap.PositionX ? ` @ ${sap.PositionX.toFixed(1)}\t${sap.PositionY.toFixed(1)}\t${sap.PositionZ.toFixed(1)}` : "";
          const squadInfo = sap.SpawnedGenericMembers?.entries()
            .map(([_k, v]) => `${v.SpawnedSquadMembersCount} ${v.SpawnedPrototypeSID}`)
            .join(" + ");
          if (squadInfo) {
            return [sap.SID, `${squadInfo}${pos}`];
          }
          const maybeContainer = sap.SpawnedPrototypeSID && `${sap.SpawnedPrototypeSID}`;
          if (maybeContainer) {
            return [sap.SID, `${maybeContainer}${pos}`];
          }
          return [sap.SID, sap.__internal__?.refkey?.toString() || sap.SID];
        }),
      ),
    ),
  );
}

function getContent(
  context: MetaContext<Struct>,
  globalVars: Set<string>,
  globalFunctions: Map<string, string>,
  questActors: Set<string>,
  launchOnQuestStart: any[],
) {
  const contextT = context as MetaContext<
    QuestNodePrototype & {
      LaunchersBySID: GetStructType<Record<string, { SID: string; Name: string }[]>>;
      Launches: { SID: string; Name: string }[];
    }
  >;
  const subscriptions = Object.fromEntries(EVENTS.map((e) => [e, getEventHandler(e)]));
  return contextT.array
    .map((struct) => {
      struct.SID = struct.SID.replace(/[!.]/g, "_");
      if (!struct.Launchers) {
        return struct;
      }
      struct.Launchers.forEach(([_k, launcher]) => {
        launcher.Connections.forEach(([_k, item]) => {
          contextT.structsById[item.SID].Launches ||= [];
          contextT.structsById[item.SID].Launches.push({
            SID: struct.SID,
            Name: item.Name,
          });
          struct.LaunchersBySID ||= new Struct() as any;
          struct.LaunchersBySID[item.SID] ||= launcher.Connections;
        });
      });
      return struct;
    })
    .map((struct) => {
      const subscription = subscriptions[struct.NodeType.split("::").pop()];
      if (struct.LaunchOnQuestStart && !subscription) {
        launchOnQuestStart.push(struct.SID);
      }

      /**
       * @param {string} caller - SID of the quest node that called this node.
       * @param {string} name - Name of the quest node output pin that called this node.
       */
      const structBody = getStructBody(struct, globalVars, globalFunctions, questActors);
      if (!subscription) {
        return structBody;
      }
      const args = new Set(
        struct
          .entries()
          .filter(([k]) => EVENTS_INTERESTING_PROPS.has(k) || EVENTS_INTERESTING_SIDS.has(k))
          .map(([_k, v]) => {
            if (EVENTS_INTERESTING_SIDS.has(_k)) {
              questActors.add(v);
              return `questActors['${v}']`;
            }
            return v;
          }),
      );

      return `${structBody}\n${subscription(struct.SID, [...args].join(", "))}`;
    })
    .join("\n");
}
