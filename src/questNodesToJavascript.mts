import { MetaContext } from "./metaType.mjs";
import { QuestNodePrototype } from "s2cfgtojson";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
import { writeFileSync } from "node:fs";

export function questNodesToJavascript(context: MetaContext<QuestNodePrototype>) {
  const contextT = context as MetaContext<
    QuestNodePrototype & {
      LaunchersBySID: Record<string, QuestNodePrototype["Launchers"]["0"]["Connections"]["0"][]>;
      Launches: { SID: string; Name: string }[];
    }
  >;
  const globalVars = new Set<string>();
  const globalFunctions = new Set<string>();
  globalVars.add(`getFunctionBody = (fn) => fn.toString().split('\\n').slice(4, -1).map(line => line.trim()).filter(l=>l).join('\\n'); // `);
  globalFunctions.add("onNPCDeathEvent = (target, fn) => { console.log(`onNPCDeathEvent('${target ?? ''}', () => ${fn.name}())`) }; //");
  globalFunctions.add("onTickEvent = (target, fn) => { console.log(`onTickEvent('${target ?? ''}', () => ${fn.name}())`) }; //");
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
          struct.LaunchersBySID ||= {};
          struct.LaunchersBySID[item.SID] ||= launcher.Connections.entries().map(([_k, v]) => v);
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
            return `if (${isBool ? (Name === "True" ? "result" : "!result") : `result === "${Name}"`}) ${SID}('${struct.SID}', '${Name}');`;
          }).join("\n");
        } else {
          launches = struct.Launches.map(({ SID, Name }) => `${SID}('${struct.SID}', '${Name}');`).join("\n");
        }
        delete struct.Launches;
      }
      const atLeastSomeLaunchersAreCodependent =
        struct.LaunchersBySID && Object.values(struct.LaunchersBySID).length && Object.values(struct.LaunchersBySID).some((v) => v.length > 1);

      const subscription = subscriptions[struct.NodeType];

      /**
       * @param {string} caller - SID of the quest node that called this node.
       * @param {string} name - Name of the quest node output pin that called this node.
       */
      const content = `
     function ${struct.SID}(caller, name) {         
         ${atLeastSomeLaunchersAreCodependent ? `waitFor(() => (${struct.SID}.Conditions[caller].every(({ SID, Name }) => ${struct.SID}.State[SID] === (Name ?? true)))).then(() => {` : ""}
           console.log('// ------------------------------');
           console.log('// ${struct.SID}(', caller, ',', name, ');');
           ${atLeastSomeLaunchersAreCodependent ? `${struct.SID}.State[caller] = name ?? true;` : ""}
           ${questNodeToJavascript(struct, globalVars, globalFunctions)}
           ${launches}
         ${atLeastSomeLaunchersAreCodependent ? "})" : ""} 
     }
    
    ${
      atLeastSomeLaunchersAreCodependent
        ? `
     ${struct.SID}.State = {};
      ${struct.SID}.Conditions = ${
        JSON.stringify(struct.LaunchersBySID, (key, value) => {
          if (key === "__internal__") {
            return undefined;
          } else {
            return value;
          }
        })?.replace(/"SID":"(\w+)"/g, "SID: $1") || "{}"
      };
    `.trim()
        : ""
    }
     
    `.trim();

      if (subscription) {
        return `${content}\n${subscription(struct.SID, `'${struct.TargetQuestGuid}'`)}`;
      }
      return content;
    })
    .join("\n");
  return `
  const hasQuestNodeExecuted = (fn) =>{
    if (fn.State && !!Object.keys(fn.State).length) {
        console.log(\`hasQuestNodeExecuted(\${fn.name}) => true\`);
        return true;
    }
    console.log(\`hasQuestNodeExecuted(\${fn.name}) => false\`);
    return false;
};
  function waitFor(condition, timeout = 2000) {
    return new Promise((resolve, reject) => {
        const to = setTimeout(() => {
            clearInterval(interval);
            reject(new Error("Timeout waiting for condition " + condition.toString()));
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
    .map((v) => `const ${v} = (...args) => { console.log('${v}(', typeof args[0] === 'function' ? args[0].name : args, ');') }`)
    .join("\n")}
  ${content}
  ${contextT.array[0].SID}()
  `;
}

function questNodeToJavascript(struct: QuestNodePrototype, globalVars: Set<string>, globalFunctions: Set<string>) {
  // noinspection FallThroughInSwitchStatementJS
  switch (struct.NodeType) {
    case "EQuestNodeType::ConsoleCommand":
      break;
    case "EQuestNodeType::LookAt":
      break;
    case "EQuestNodeType::ALifeDirectorZoneSwitch":
      break;
    case "EQuestNodeType::AchievementUnlock":
      break;
    case "EQuestNodeType::ActivateAnomaly":
      break;
    case "EQuestNodeType::ActivateInteractableObject":
      break;
    case "EQuestNodeType::ActivateRestrictor":
      globalFunctions.add("activateRestrictor");
      return `activateRestrictor('${struct.VolumeGuid}');`;
    case "EQuestNodeType::AddNote":
      break;
    case "EQuestNodeType::AddOrRemoveFromSquad":
      break;
    case "EQuestNodeType::AddTechnicianSkillOrUpgrade":
      break;
    case "EQuestNodeType::BridgeCleanUp":
      break;
    case "EQuestNodeType::BridgeEvent":
      break;
    case "EQuestNodeType::CancelAllSideQuests":
      break;
    case "EQuestNodeType::ChangeFaction":
      break;
    case "EQuestNodeType::ChangeRelationships":
      globalFunctions.add("setFactionRelationship");
      globalFunctions.add("addFactionRelationship");

      return `${struct.UseDeltaValue ? "add" : "set"}FactionRelationship('${struct.FirstTargetSID === "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" ? "Skif" : struct.FirstTargetSID}', '${struct.SecondTargetSID === "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" ? "Skif" : struct.SecondTargetSID}',  ${struct.RelationshipValue});`;
    case "EQuestNodeType::If":
    case "EQuestNodeType::Condition":
      const andOr = struct.Conditions.ConditionCheckType === "EConditionCheckType::Or" ? " || " : " && ";
      delete struct.Conditions.ConditionCheckType;
      return `const result = ${struct.Conditions.entries()
        .map(([_k, cond]) => {
          if (typeof cond === "string") {
            return;
          }
          return cond
            .entries()
            .map(([_k, c]) => {
              switch (c.ConditionType) {
                case "EQuestConditionType::Weather":
                  break;
                case "EQuestConditionType::Random":
                  break;
                case "EQuestConditionType::Trigger":
                  break;
                case "EQuestConditionType::Emission":
                  break;
                case "EQuestConditionType::Money":
                  break;
                case "EQuestConditionType::Rank":
                  break;
                case "EQuestConditionType::JournalState":
                  break;
                case "EQuestConditionType::NodeState":
                  globalFunctions.add("getQuestNodeState");
                  globalVars.add(c.TargetNode);
                  return `getQuestNodeState(${c.TargetNode}) ${getConditionComparance(c.ConditionComparance)} '${c.NodeState.split("::").pop()}'`;
                case "EQuestConditionType::Bleeding":
                  break;
                case "EQuestConditionType::HP":
                  break;
                case "EQuestConditionType::HPPercent":
                  break;
                case "EQuestConditionType::HungerPoints":
                  break;
                case "EQuestConditionType::InventoryWeight":
                  break;
                case "EQuestConditionType::Radiation":
                  break;
                case "EQuestConditionType::AITarget":
                  break;
                case "EQuestConditionType::ArmorState":
                  break;
                case "EQuestConditionType::Awareness":
                  break;
                case "EQuestConditionType::Bridge":
                  globalVars.add(c.LinkedNodePrototypeSID);
                  c.CompletedNodeLauncherNames.entries().forEach(([_k, v]) => globalVars.add(v));
                  return `${getConditionComparance(c.ConditionComparance) === "===" ? "" : "!"}hasQuestNodeExecuted(${c.LinkedNodePrototypeSID}, [${c.CompletedNodeLauncherNames.entries()
                    .map(([_k, v]) => v)
                    .join()}])`;
                case "EQuestConditionType::ContextualAction":
                  break;
                case "EQuestConditionType::CorpseCarry":
                  break;
                case "EQuestConditionType::DistanceToNPC":
                  break;
                case "EQuestConditionType::DistanceToPoint":
                  break;
                case "EQuestConditionType::Effect":
                  break;
                case "EQuestConditionType::EquipmentInHands":
                  break;
                case "EQuestConditionType::FactionRelationship":
                  break;
                case "EQuestConditionType::FastTravelMoney":
                  break;
                case "EQuestConditionType::GlobalVariable":
                  break;
                case "EQuestConditionType::HasItemInQuickSlot":
                  break;
                case "EQuestConditionType::IsAlive":
                  break;
                case "EQuestConditionType::IsCreated":
                  globalFunctions.add("isObjectCreated");
                  return `${getConditionComparance(c.ConditionComparance) === "===" ? "" : "!"}isObjectCreated('${c.TargetPlaceholder}')`;
                case "EQuestConditionType::IsDialogMemberValid":
                  break;
                case "EQuestConditionType::IsEnoughAmmo":
                  break;
                case "EQuestConditionType::IsOnline":
                  break;
                case "EQuestConditionType::IsWeaponJammed":
                  break;
                case "EQuestConditionType::IsWounded":
                  break;
                case "EQuestConditionType::ItemInContainer":
                  break;
                case "EQuestConditionType::ItemInInventory":
                  break;
                case "EQuestConditionType::LookAtAngle":
                  break;
                case "EQuestConditionType::Note":
                  break;
                case "EQuestConditionType::PersonalRelationship":
                  break;
                case "EQuestConditionType::PlayerOverload":
                  break;
                case "EQuestConditionType::Psy":
                  break;
                case "EQuestConditionType::Stamina":
                  break;
              }
            })
            .join(andOr);
        })
        .join(andOr)}; ${struct.NodeType === "EQuestNodeType::If" ? "" : "\nif (!result) return"};`;
    case "EQuestNodeType::Container":
      break;
    case "EQuestNodeType::DeactivateZone":
      break;
    case "EQuestNodeType::Despawn":
      globalFunctions.add("despawn");
      return `despawn('${struct.TargetQuestGuid}');`;
    case "EQuestNodeType::DisableNPCBark":
      break;
    case "EQuestNodeType::DisableNPCInteraction":
      break;
    case "EQuestNodeType::EmissionScheduleControl":
      break;
    case "EQuestNodeType::EmissionStart":
      break;
    case "EQuestNodeType::EnableDataLayer":
      break;
    case "EQuestNodeType::End":
      return "";
    case "EQuestNodeType::EquipItemInHands":
      break;
    case "EQuestNodeType::FlashlightOnOff":
      break;
    case "EQuestNodeType::ForceInteract":
      break;
    case "EQuestNodeType::GiveCache":
      break;
    case "EQuestNodeType::HideLoadingScreen":
      break;
    case "EQuestNodeType::HideTutorial":
      break;
    case "EQuestNodeType::ItemAdd":
      break;
    case "EQuestNodeType::ItemRemove":
      break;
    case "EQuestNodeType::LoadAsset":
      break;
    case "EQuestNodeType::MoveInventory":
      break;
    case "EQuestNodeType::NPCBark":
      break;
    case "EQuestNodeType::OnAbilityEndedEvent":
      break;
    case "EQuestNodeType::OnAbilityUsedEvent":
      break;
    case "EQuestNodeType::OnDialogStartEvent":
      break;
    case "EQuestNodeType::OnEmissionFinishEvent":
      break;
    case "EQuestNodeType::OnEmissionStageActivated":
      break;
    case "EQuestNodeType::OnEmissionStageFinished":
      break;
    case "EQuestNodeType::OnEmissionStartEvent":
      break;
    case "EQuestNodeType::OnFactionBecomeEnemyEvent":
      break;
    case "EQuestNodeType::OnFactionBecomeFriendEvent":
      break;
    case "EQuestNodeType::OnGetCompatibleAttachEvent":
      break;
    case "EQuestNodeType::OnHitEvent":
      break;
    case "EQuestNodeType::OnInfotopicFinishEvent":
      break;
    case "EQuestNodeType::OnInteractEvent":
      break;
    case "EQuestNodeType::OnJournalQuestEvent":
      break;
    case "EQuestNodeType::OnKillerCheckEvent":
      break;
    case "EQuestNodeType::OnMoneyAmountReachedEvent":
      break;
    case "EQuestNodeType::OnNPCBecomeEnemyEvent":
      break;
    case "EQuestNodeType::OnNPCBecomeFriendEvent":
      break;
    case "EQuestNodeType::OnNPCCreateEvent":
      break;
    case "EQuestNodeType::OnNPCDefeatEvent":
      break;
    case "EQuestNodeType::OnPlayerGetItemEvent":
      break;
    case "EQuestNodeType::OnPlayerLostItemEvent":
      break;
    case "EQuestNodeType::OnPlayerNoticedEvent":
      break;
    case "EQuestNodeType::OnSignalReceived":
      break;
    case "EQuestNodeType::PlayEffect":
      break;
    case "EQuestNodeType::PlayPostProcess":
      break;
    case "EQuestNodeType::PlaySound":
      break;
    case "EQuestNodeType::PlayVideo":
      break;
    case "EQuestNodeType::ProtectLairNPCSquadItem":
      break;
    case "EQuestNodeType::Random":
      return `const result = (() => { 
      const rand = Math.random();
      ${struct.PinWeights.entries()
        .map(([_k, weight], i) => `if (rand >= ${weight}) return '${struct.OutputPinNames?.[i] ?? "impossible"}'`)
        .join("\nelse ")}
        })();`;
    case "EQuestNodeType::ReputationLocker":
      break;
    case "EQuestNodeType::ResetAI":
      break;
    case "EQuestNodeType::RestrictSave":
      break;
    case "EQuestNodeType::RestrictionArea":
      break;
    case "EQuestNodeType::SaveGame":
      break;
    case "EQuestNodeType::ScheduledContainer":
      break;
    case "EQuestNodeType::SearchPoint":
      break;
    case "EQuestNodeType::SendSignal":
      break;
    case "EQuestNodeType::SequenceStart":
      break;
    case "EQuestNodeType::SetAIBehavior":
      globalFunctions.add("setAIBehavior");
      return `setAIBehavior('${struct.TargetQuestGuid}', '${struct.BehaviorType.split("::").pop()}');`;
    case "EQuestNodeType::SetCharacterEffect":
      break;
    case "EQuestNodeType::SetCharacterParam":
      break;
    case "EQuestNodeType::SetDialog":
      globalFunctions.add("setDialog");
      globalVars.add(struct.DialogChainPrototypeSID);

      return `const result = setDialog(${struct.DialogChainPrototypeSID}, [ ${struct.LastPhrases.entries().map(([_k, lp]) => {
        globalVars.add(lp.LastPhraseSID);
        globalVars.add(lp.NextLaunchedPhraseSID);
        return `{ last: ${lp.LastPhraseSID}, next: ${lp.NextLaunchedPhraseSID}, isFinal: ${lp.FinishNode} }`;
      })}]);`;
    case "EQuestNodeType::SetDurabilityParam":
      break;
    case "EQuestNodeType::SetFactionRestriction":
      break;
    case "EQuestNodeType::SetGlobalVariable":
      globalVars.add(struct.GlobalVariablePrototypeSID);
      switch (struct.ChangeValueMode) {
        case "EChangeValueMode::Add":
          return `${struct.GlobalVariablePrototypeSID} += ${struct.VariableValue};`;
        case "EChangeValueMode::Set":
          return `${struct.GlobalVariablePrototypeSID} = ${struct.VariableValue};`;
        case "EChangeValueMode::Subtract":
          return `${struct.GlobalVariablePrototypeSID} -= ${struct.VariableValue};`;
      }
      break;
    case "EQuestNodeType::SetHubOwner":
      break;
    case "EQuestNodeType::SetItemGenerator":
      globalFunctions.add("setItemGenerator");
      globalVars.add(struct.ItemGeneratorSID);
      return `setItemGenerator('${struct.TargetQuestGuid === "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" ? "Skif" : ""}', ${struct.ItemGeneratorSID});`;
    case "EQuestNodeType::SetJournal":
      globalFunctions.add("setJournal");
      globalVars.add(struct.JournalQuestSID);
      switch (struct.JournalEntity) {
        case "EJournalEntity::Quest":
          return `setJournal(${struct.JournalQuestSID}, '${struct.JournalAction.split("::").pop()}');`;
        case "EJournalEntity::QuestStage":
          return `setJournal(${struct.JournalQuestSID}, '${struct.JournalAction.split("::").pop()}'${struct.StageID ? ", " + struct.StageID : ""} );`;
      }
      break;
    case "EQuestNodeType::SetMeshGenerator":
      break;
    case "EQuestNodeType::SetNPCSequentialAbility":
      break;
    case "EQuestNodeType::SetName":
      break;
    case "EQuestNodeType::SetPersonalRestriction":
      break;
    case "EQuestNodeType::SetQuestGiver":
      break;
    case "EQuestNodeType::SetSpaceRestrictor":
      break;
    case "EQuestNodeType::SetTime":
      break;
    case "EQuestNodeType::SetTimer":
      break;
    case "EQuestNodeType::SetWeather":
      break;
    case "EQuestNodeType::SetWounded":
      break;
    case "EQuestNodeType::ShowFadeScreen":
      break;
    case "EQuestNodeType::ShowLoadingScreen":
      break;
    case "EQuestNodeType::ShowMarker":
      break;
    case "EQuestNodeType::ShowTutorialWidget":
      break;
    case "EQuestNodeType::Spawn":
      globalFunctions.add("spawn");
      return `spawn('${struct.TargetQuestGuid}', { ignoreDamageType: '${struct.IgnoreDamageType}', spawnHidden: ${struct.SpawnHidden}, spawnNodeExcludeType: '${struct.SpawnNodeExcludeType}' });`;
    case "EQuestNodeType::SpawnAnomaly":
      break;
    case "EQuestNodeType::SpawnAnomalySpawner":
      break;
    case "EQuestNodeType::SpawnArtifactSpawner":
      break;
    case "EQuestNodeType::SpawnDeadBody":
      break;
    case "EQuestNodeType::SpawnItemContainer":
      break;
    case "EQuestNodeType::SpawnLair":
      break;
    case "EQuestNodeType::SpawnSafeZone":
      break;
    case "EQuestNodeType::SpawnSingleObj":
      break;
    case "EQuestNodeType::SpawnSquad":
      break;
    case "EQuestNodeType::SpawnTrigger":
      break;
    case "EQuestNodeType::SwitchQuestItemState":
      break;
    case "EQuestNodeType::Technical":
      return "";
    case "EQuestNodeType::TeleportCharacter":
      break;
    case "EQuestNodeType::TimeLock":
      break;
    case "EQuestNodeType::ToggleLairActivity":
      break;
    case "EQuestNodeType::ToggleNPCHidden":
      break;
    case "EQuestNodeType::TrackJournal":
      break;
    case "EQuestNodeType::TrackShelter":
      break;
    case "EQuestNodeType::Trigger":
      break;
  }
  return "";
}

function getConditionComparance(ConditionComparance: string) {
  switch (ConditionComparance) {
    case "EConditionComparance::Equal":
      return "===";
    case "EConditionComparance::Greater":
      return ">";
    case "EConditionComparance::GreaterOrEqual":
      return ">=";
    case "EConditionComparance::Less":
      return "<";
    case "EConditionComparance::LessOrEqual":
      return "<=";
    case "EConditionComparance::NotEqual":
      return "!==";
  }
}

["QuestNodePrototypes/RSQ08_C01_K_M.cfg", "QuestNodePrototypes/RSQ08_C02_K_B.cfg"].forEach(async (filePath) => {
  const context = {
    fileIndex: 0,
    index: 0,
    array: [],
    filePath,
    structsById: {},
  };

  context.array = await readFileAndGetStructs<QuestNodePrototype>(filePath);
  context.structsById = Object.fromEntries(context.array.map((s) => [s.__internal__.rawName, s as QuestNodePrototype]));

  const r = questNodesToJavascript(context);
  writeFileSync(`/home/sdwvit/.config/JetBrains/IntelliJIdea2025.1/scratches/${context.array[0].SID}.js`, r);
});
