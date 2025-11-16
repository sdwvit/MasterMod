import { MetaContext } from "./metaType.mjs";
import { GetStructType, QuestNodePrototype, SpawnActorPrototype, Struct } from "s2cfgtojson";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
import { writeFileSync } from "node:fs";
import { onL1Finish } from "./l1-cache.mjs";

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
  globalVars.add(`getFunctionBody = (fn) => fn.toString().split('\\n').slice(4, -1).map(line => line.trim()).filter(l=>l).join('\\n'); // `);

  const subscriptions = Object.fromEntries(EVENTS.map((e) => [e, getEventHandler(e)]));

  const content = contextT.array
    .map((struct) => {
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

      const subscription = subscriptions[struct.NodeType.split("::").pop()];
      if (struct.LaunchOnQuestStart && !subscription) {
        launchOnQuestStart.push(struct.SID);
      }

      /**
       * @param {string} caller - SID of the quest node that called this node.
       * @param {string} name - Name of the quest node output pin that called this node.
       */
      const content = `
     function ${struct.SID}(caller, name) {         
         ${struct.SID}.Conditions ??= ${JSON.stringify(struct.LaunchersBySID, (key, value) => (key === "__internal__" ? undefined : value)) || "{}"}
         ${struct.SID}.State ??= {};
         ${struct.SID}.State[caller] = name || true;
         ${atLeastSomeLaunchersAreCodependent ? `waitForCallers(1000, ${struct.SID}, caller).then(() => {` : ""}
           ${questNodeToJavascript(struct, globalVars, globalFunctions, questActors)}
           ${launches}
           console.log('// ${struct.SID}(${atLeastSomeLaunchersAreCodependent ? "', caller, ',', name, '" : ""});');
         ${atLeastSomeLaunchersAreCodependent ? "}).catch(e => console.log(e))" : ""} 
     }
    `.trim();
      if (subscription) {
        const args = new Set(
          struct
            .entries()
            .filter(([k]) => EVENTS_INTERESTING_PROPS.has(k))
            .map(([_k, v]) => v),
        );
        if (struct.TargetQuestGuid) {
          questActors.add(struct.TargetQuestGuid);
          args.delete("TargetQuestGuid");
          args.add(`questActors['${struct.TargetQuestGuid}']`);
        }
        if (struct.ItemPrototypeSID) {
          questActors.add(struct.ItemPrototypeSID);
          args.delete("ItemPrototypeSID");
          args.add(`questActors['${struct.ItemPrototypeSID}']`);
        }

        return `${content}\n${subscription(struct.SID, [...args].join(", "))}`;
      }
      return content;
    })
    .join("\n");
  return `
  const intervals = [];
  const Skif = 'Skif';
  const spawnedActors = {};
  const questActors = ${JSON.stringify(
    Object.fromEntries(
      [["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "Skif"]].concat(
        (
          await Promise.all(
            [...questActors]
              .filter((e) => e !== "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
              .map(async (qa) => {
                let res: SpawnActorPrototype[];
                try {
                  res = await readFileAndGetStructs(`${qa}.cfg`);
                } catch (e) {
                  res = await readFileAndGetStructs(`QuestItemPrototypes.cfg`, (content) => (content.includes(qa) ? content : ""));
                  if (res.length === 0) {
                    throw e;
                  }
                }

                return res.find((s) => s.SID === qa);
              }),
          )
        ).map((sap: SpawnActorPrototype) => {
          const squadInfo = sap.SpawnedGenericMembers?.entries()
            .map(([_k, v]) => `${v.SpawnedSquadMembersCount} ${v.SpawnedPrototypeSID}`)
            .join(", ");
          const maybeContainer = sap.SpawnedPrototypeSID;
          return [sap.SID, squadInfo || maybeContainer || sap.__internal__.refkey?.toString() || sap.SID];
        }),
      ),
    ),
  )}
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
    case "Container":
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
    case "SwitchQuestItemState":
      globalFunctions.set(subType, "");
      return `${subType}(${struct
        .entries()
        .map(([k]) => {
          if (k === "TargetQuestGuid" || k === "ItemPrototypeSID" || k === "ItemSID") {
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
function waitForCallers(timeout: number, struct: { State: any; Conditions: { [x: string]: any }; name: any }, caller: string | number) {
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
              break;
            case "Random":
              break;
            case "Trigger":
              break;
            case "Emission":
              break;
            case "Money":
              break;
            case "Rank":
              break;
            case "JournalState":
              break;
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
              break;
            case "HP":
              break;
            case "HPPercent":
              break;
            case "HungerPoints":
              break;
            case "InventoryWeight":
              break;
            case "Radiation":
              break;
            case "AITarget":
              break;
            case "ArmorState":
              break;
            case "Awareness":
              break;
            case "Bridge":
              globalFunctions.set(c.LinkedNodePrototypeSID, "");
              c.CompletedNodeLauncherNames.entries().forEach(([_k, v]) => globalVars.add(v));
              return `hasQuestNodeExecuted(${c.LinkedNodePrototypeSID}, [${c.CompletedNodeLauncherNames.entries()
                .map(([_k, v]) => v)
                .join(", ")}]) ${getConditionComparance(c.ConditionComparance)} true`;
            case "ContextualAction":
              break;
            case "CorpseCarry":
              break;
            case "DistanceToNPC":
              break;
            case "DistanceToPoint":
              break;
            case "Effect":
              break;
            case "EquipmentInHands":
              break;
            case "FactionRelationship":
              break;
            case "FastTravelMoney":
              break;
            case "GlobalVariable":
              break;
            case "HasItemInQuickSlot":
              break;
            case "IsAlive":
              break;
            case "IsCreated":
              globalFunctions.set(
                "isObjectCreated",
                "(actor) => { const created = !!spawnedActors[actor]; console.log(`isObjectCreated(\${actor}) === \${created}`); return created; };",
              );
              questActors.add(c.TargetPlaceholder);
              return `${getConditionComparance(c.ConditionComparance) === "===" ? "" : "!"}isObjectCreated(questActors['${c.TargetPlaceholder}'])`;
            case "IsDialogMemberValid":
              break;
            case "IsEnoughAmmo":
              break;
            case "IsOnline":
              break;
            case "IsWeaponJammed":
              break;
            case "IsWounded":
              break;
            case "ItemInContainer":
              break;
            case "ItemInInventory":
              globalFunctions.set("isItemInInventory", "");
              globalVars.add(c.ItemPrototypeSID.VariableValue);
              return `isItemInInventory(${c.ItemPrototypeSID.VariableValue}) ${getConditionComparance(c.ConditionComparance)} ${c.ItemsCount.VariableValue}`;
            case "LookAtAngle":
              break;
            case "Note":
              break;
            case "PersonalRelationship":
              break;
            case "PlayerOverload":
              break;
            case "Psy":
              break;
            case "Stamina":
              break;
          }
        })
        .join(andOr);
    })
    .join(andOr)} ${subType === "If" ? "" : "; \nif (!result) return"};`;
}

await Promise.all(
  [
    "/QuestNodePrototypes/RSQ08_C03_K_S.cfg",
    "/QuestNodePrototypes/RSQ08_C04_B_B.cfg",
    "/QuestNodePrototypes/RSQ08_C05_B_B.cfg",
    "/QuestNodePrototypes/RSQ08_C06_B_A.cfg",
    "/QuestNodePrototypes/RSQ08_C07_B_A.cfg",
    "/QuestNodePrototypes/RSQ08_C08_B_A.cfg",
    "/QuestNodePrototypes/RSQ08_C09_S_P.cfg",
  ].map(async (filePath) => {
    const context = {
      fileIndex: 0,
      index: 0,
      array: [],
      filePath,
      structsById: {},
    };

    context.array = await readFileAndGetStructs<QuestNodePrototype>(filePath);
    context.structsById = Object.fromEntries(context.array.map((s) => [s.__internal__.rawName, s as QuestNodePrototype]));

    const r = (await questNodesToJs(context)).replaceAll(`${(context.array[0] as QuestNodePrototype).QuestSID}_`, "");
    writeFileSync(`/home/sdwvit/.config/JetBrains/IntelliJIdea2025.1/scratches/${context.array[0].SID}.js`, r);
    // console.log(`\n\nExecuting quest node script for ${filePath}`);
    // await eval(r);
  }),
).then(onL1Finish);

function getEventHandler(eventName: string) {
  return (target: string, content?: string) => `${eventName}(${target}${content ? `, ${content}` : ""});`;
}
