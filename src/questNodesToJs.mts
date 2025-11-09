import { MetaContext } from "./metaType.mjs";
import { GetStructType, QuestNodePrototype, SpawnActorPrototype, Struct } from "s2cfgtojson";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
import { writeFileSync } from "node:fs";
import { L1Cache, onL1Finish } from "./l1-cache.mjs";

export async function questNodesToJs(context: MetaContext<QuestNodePrototype>) {
  const contextT = context as MetaContext<
    QuestNodePrototype & {
      LaunchersBySID: GetStructType<Record<string, { SID: string; Name: string }[]>>;
      Launches: { SID: string; Name: string }[];
    }
  >;
  const globalVars = new Set<string>();
  const globalFunctions = new Set<string>();
  const questActors = new Set<string>();

  questActors.add("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"); // Skif
  globalVars.add(`getFunctionBody = (fn) => fn.toString().split('\\n').slice(4, -1).map(line => line.trim()).filter(l=>l).join('\\n'); // `);
  globalFunctions.add("onNPCDeathEvent = (target, fn) => { return; console.log(`onNPCDeathEvent('${target ?? ''}', () => ${fn.name}())`) }; //");
  globalFunctions.add(
    "onTickEvent = (target, fn) => { console.log(`onTickEvent('${target ?? ''}', () => ${fn.name}())`); intervals.push(setInterval(fn, 200)) }; //",
  );
  const subscriptions = {
    "EQuestNodeType::OnNPCDeathEvent": (content: string, target: string) => `onNPCDeathEvent(${target}, ${content});`,
    "EQuestNodeType::OnTickEvent": (content: string, target: string) => `onTickEvent(${target}, ${content});`,
  };

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
        struct.LaunchersBySID && struct.LaunchersBySID.entries().length && struct.LaunchersBySID.entries().some(([k, v]) => v.entries().length > 1);

      const subscription = subscriptions[struct.NodeType];

      /**
       * @param {string} caller - SID of the quest node that called this node.
       * @param {string} name - Name of the quest node output pin that called this node.
       */
      const content = `
     function ${struct.SID}(caller, name) {         
         ${struct.SID}.Conditions ??= ${JSON.stringify(struct.LaunchersBySID, (key, value) => (key === "__internal__" ? undefined : value)) || "{}"}
         ${struct.SID}.State ??= {};
         ${struct.SID}.State[caller] = name || true;

         ${atLeastSomeLaunchersAreCodependent ? `waitFor(() => (Object.values(${struct.SID}.Conditions[caller]).every(({ SID, Name }) => ${struct.SID}.State[SID] === (Name || true)))).then(() => {` : ""}
           console.log('// ${struct.SID}(${atLeastSomeLaunchersAreCodependent ? "', caller, ',', name, '" : ""});');
           ${questNodeToJavascript(struct, globalVars, globalFunctions, questActors)}
           ${launches}
         ${atLeastSomeLaunchersAreCodependent ? "}).catch(e => console.log(e))" : ""} 
     }
    `.trim();

      if (subscription) {
        if (struct.TargetQuestGuid) {
          questActors.add(struct.TargetQuestGuid);
          return `${content}\n${subscription(struct.SID, `questActors['${struct.TargetQuestGuid}']`)}`;
        } else {
          return `${content}\n${subscription(struct.SID)}`;
        }
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
              .map((qa) => readFileAndGetStructs(`${qa}.cfg`).then((results) => results[0])),
          )
        ).map((sap: SpawnActorPrototype) => [
          sap.SID,
          sap.SpawnedGenericMembers?.entries()
            .map(([_k, v]) => `${v.SpawnedSquadMembersCount} ${v.SpawnedPrototypeSID}`)
            .join(", "),
        ]),
      ),
    ),
  )}
  const hasQuestNodeExecuted = (fn) =>{
    if (fn.State && !!Object.keys(fn.State).length) {
        console.log(\`hasQuestNodeExecuted(\${fn.name}) === true\`);
        return true;
    }
    console.log(\`hasQuestNodeExecuted(\${fn.name}) === false\`);
    return false;
};
  function waitFor(condition, timeout = 2000) {
    return new Promise((resolve, reject) => {
        const to = setTimeout(() => {
            clearInterval(interval);
            reject("Timeout waiting for condition " + condition.toString());
        }, timeout);

        const interval = setInterval(() => {
            if (condition()) {
                clearTimeout(to);
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}
  ${[...globalVars]
    .filter((v) => v && !contextT.structsById[v])
    .map((v) => `let ${v} = '${v}';`)
    .join("\n")}
  ${[...globalFunctions]
    .filter((v) => v && !contextT.structsById[v])
    .map((v) => `const ${v} = (...args) => { console.log('${v}(', typeof args[0] === 'function' ? args[0].name : args, ');'); return '${v}'; }`)
    .join("\n")}
  ${content}
  ${contextT.array[0].SID}();
  setTimeout(() => {
    intervals.forEach(i => clearInterval(i));
  }, 2000);
  `;
}

function questNodeToJavascript(structr: Struct, globalVars: Set<string>, globalFunctions: Set<string>, questActors: Set<string>): string {
  const struct = structr as QuestNodePrototype;
  const subType = struct.NodeType.split("::").pop();

  // noinspection FallThroughInSwitchStatementJS
  switch (subType) {
    case "ConsoleCommand":
      break;
    case "LookAt":
      break;
    case "ALifeDirectorZoneSwitch":
      break;
    case "AchievementUnlock":
      break;
    case "ActivateAnomaly":
      break;
    case "ActivateInteractableObject":
      break;
    case "ActivateRestrictor":
      globalFunctions.add("activateRestrictor");
      return `activateRestrictor('${struct.VolumeGuid}');`;
    case "AddNote":
      break;
    case "AddOrRemoveFromSquad":
      break;
    case "AddTechnicianSkillOrUpgrade":
      break;
    case "BridgeCleanUp":
      break;
    case "BridgeEvent":
      break;
    case "CancelAllSideQuests":
      break;
    case "ChangeFaction":
      break;
    case "ChangeRelationships":
      globalFunctions.add("setFactionRelationship");
      globalFunctions.add("addFactionRelationship");

      questActors.add(struct.FirstTargetSID);
      return `${struct.UseDeltaValue ? "add" : "set"}FactionRelationship(questActors['${struct.FirstTargetSID}'], '${struct.SecondTargetSID}',  ${struct.RelationshipValue});`;

    case "If":
    case "Condition":
      const andOr = struct.Conditions.ConditionCheckType === "EConditionCheckType::Or" ? " || " : " && ";
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
                  globalFunctions.add("getQuestNodeState");
                  globalVars.add(c.TargetNode);
                  return `getQuestNodeState(${c.TargetNode}) ${getConditionComparance(c.ConditionComparance)} '${c.NodeState.split("::").pop()}'`;
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
                  globalFunctions.add(c.LinkedNodePrototypeSID);
                  c.CompletedNodeLauncherNames.entries().forEach(([_k, v]) => globalVars.add(v));
                  return `hasQuestNodeExecuted(${c.LinkedNodePrototypeSID}, [${c.CompletedNodeLauncherNames.entries()
                    .map(([_k, v]) => v)
                    .join()}]) ${getConditionComparance(c.ConditionComparance)} true`;
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
                  globalFunctions.add(
                    "isObjectCreated = (actor) => { const created = !!spawnedActors[actor]; console.log(`isObjectCreated(\${actor}) === \${created}`); return created; }; //",
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
                  break;
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
    case "Container":
      break;
    case "DeactivateZone":
      break;
    case "Despawn":
      questActors.add(struct.TargetQuestGuid);
      globalFunctions.add("despawn = (actor) => { delete spawnedActors[actor]; console.log(`despawn(\${actor})`); }; //");
      return `despawn(questActors['${struct.TargetQuestGuid}']);`;
    case "DisableNPCBark":
      break;
    case "DisableNPCInteraction":
      break;
    case "EmissionScheduleControl":
      break;
    case "EmissionStart":
      break;
    case "EnableDataLayer":
      break;
    case "End":
      return "";
    case "EquipItemInHands":
      break;
    case "FlashlightOnOff":
      break;
    case "ForceInteract":
      break;
    case "GiveCache":
      break;
    case "HideLoadingScreen":
      break;
    case "HideTutorial":
      break;
    case "ItemAdd":
      break;
    case "ItemRemove":
      break;
    case "LoadAsset":
      break;
    case "MoveInventory":
      break;
    case "NPCBark":
      break;
    case "OnAbilityEndedEvent":
      break;
    case "OnAbilityUsedEvent":
      break;
    case "OnDialogStartEvent":
      break;
    case "OnEmissionFinishEvent":
      break;
    case "OnEmissionStageActivated":
      break;
    case "OnEmissionStageFinished":
      break;
    case "OnEmissionStartEvent":
      break;
    case "OnFactionBecomeEnemyEvent":
      break;
    case "OnFactionBecomeFriendEvent":
      break;
    case "OnGetCompatibleAttachEvent":
      break;
    case "OnHitEvent":
      break;
    case "OnInfotopicFinishEvent":
      break;
    case "OnInteractEvent":
      break;
    case "OnJournalQuestEvent":
      break;
    case "OnKillerCheckEvent":
      break;
    case "OnMoneyAmountReachedEvent":
      break;
    case "OnNPCBecomeEnemyEvent":
      break;
    case "OnNPCBecomeFriendEvent":
      break;
    case "OnNPCCreateEvent":
      break;
    case "OnNPCDefeatEvent":
      break;
    case "OnPlayerGetItemEvent":
      break;
    case "OnPlayerLostItemEvent":
      break;
    case "OnPlayerNoticedEvent":
      break;
    case "OnSignalReceived":
      break;
    case "PlayEffect":
      break;
    case "PlayPostProcess":
      break;
    case "PlaySound":
      break;
    case "PlayVideo":
      break;
    case "ProtectLairNPCSquadItem":
      break;
    case "Random":
      return `const result = (() => { 
      const rand = Math.random();
      ${struct.PinWeights.entries()
        .map(([_k, weight], i) => `if (rand >= ${weight}) return '${struct.OutputPinNames?.[i] ?? "impossible"}'`)
        .join("\nelse ")}
        })();`;
    case "ReputationLocker":
      break;
    case "ResetAI":
      break;
    case "RestrictSave":
      break;
    case "RestrictionArea":
      break;
    case "SaveGame":
      break;
    case "ScheduledContainer":
      break;
    case "SearchPoint":
      break;
    case "SendSignal":
      break;
    case "SequenceStart":
      break;
    case "SetAIBehavior":
      globalFunctions.add("setAIBehavior");
      return `setAIBehavior('${struct.TargetQuestGuid}', '${struct.BehaviorType.split("::").pop()}');`;
    case "SetCharacterEffect":
      break;
    case "SetCharacterParam":
      break;
    case "SetDialog":
      globalFunctions.add("setDialog");
      globalVars.add(struct.DialogChainPrototypeSID);

      return `const result = setDialog(${struct.DialogChainPrototypeSID}, [ ${struct.LastPhrases.entries().map(([_k, lp]) => {
        globalVars.add(lp.LastPhraseSID);
        globalVars.add(lp.NextLaunchedPhraseSID);
        return `{ last: ${lp.LastPhraseSID}, next: ${lp.NextLaunchedPhraseSID}, isFinal: ${lp.FinishNode} }`;
      })}]);`;
    case "SetDurabilityParam":
      break;
    case "SetFactionRestriction":
      break;
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
    case "SetHubOwner":
      break;
    case "SetItemGenerator":
      globalFunctions.add("setItemGenerator");
      globalVars.add(struct.ItemGeneratorSID);
      questActors.add(struct.TargetQuestGuid);
      return `setItemGenerator(questActors['${struct.TargetQuestGuid}'], ${struct.ItemGeneratorSID});`;

    case "SetJournal":
      globalFunctions.add("setJournal");
      globalVars.add(struct.JournalQuestSID);
      const setJrn = `setJournal(${struct.JournalQuestSID}, '${struct.JournalAction.split("::").pop()}'`;
      switch (struct.JournalEntity) {
        case "EJournalEntity::Quest":
          return `${setJrn});`;
        case "EJournalEntity::QuestStage":
          return `${setJrn}${struct.StageID ? ", " + struct.StageID : ""} );`;
      }
    case "SetMeshGenerator":
      break;
    case "SetNPCSequentialAbility":
      break;
    case "SetName":
      break;
    case "SetPersonalRestriction":
      break;
    case "SetQuestGiver":
      break;
    case "SetSpaceRestrictor":
      break;
    case "SetTime":
      break;
    case "SetTimer":
      break;
    case "SetWeather":
      break;
    case "SetWounded":
      break;
    case "ShowFadeScreen":
      break;
    case "ShowLoadingScreen":
      break;
    case "ShowMarker":
      break;
    case "ShowTutorialWidget":
      break;
    case "Spawn":
      globalFunctions.add("spawn = (actor) => { spawnedActors[actor] = true; console.log(`spawn(\${questActors[actor]});`); return actor; }; //");
      questActors.add(struct.TargetQuestGuid);
      return `spawn('${struct.TargetQuestGuid}', { ignoreDamageType: '${struct.IgnoreDamageType}', spawnHidden: ${struct.SpawnHidden}, spawnNodeExcludeType: '${struct.SpawnNodeExcludeType}' });`;
    case "SpawnAnomaly":
      break;
    case "SpawnAnomalySpawner":
      break;
    case "SpawnArtifactSpawner":
      break;
    case "SpawnDeadBody":
      break;
    case "SpawnItemContainer":
      break;
    case "SpawnLair":
      break;
    case "SpawnSafeZone":
      break;
    case "SpawnSingleObj":
      break;
    case "SpawnSquad":
      break;
    case "SpawnTrigger":
      break;
    case "SwitchQuestItemState":
      break;
    case "Technical":
      return "";
    case "TeleportCharacter":
      break;
    case "TimeLock":
      break;
    case "ToggleLairActivity":
      break;
    case "ToggleNPCHidden":
      break;
    case "TrackJournal":
      break;
    case "TrackShelter":
      break;
    case "Trigger":
      break;
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

await Promise.all(
  ["/QuestNodePrototypes/RSQ08_C01_K_M.cfg", "/QuestNodePrototypes/RSQ08_C02_K_B.cfg"].map(async (filePath) => {
    const context = {
      fileIndex: 0,
      index: 0,
      array: [],
      filePath,
      structsById: {},
    };

    context.array = await readFileAndGetStructs<QuestNodePrototype>(filePath);
    context.structsById = Object.fromEntries(context.array.map((s) => [s.__internal__.rawName, s as QuestNodePrototype]));

    const r = await questNodesToJs(context);
    writeFileSync(`/home/sdwvit/.config/JetBrains/IntelliJIdea2025.1/scratches/${context.array[0].SID}.js`, r);
    console.log(`\n\nExecuting quest node script for ${filePath}`);
    await eval(r);
  }),
);
await onL1Finish();
