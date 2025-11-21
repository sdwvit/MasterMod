import { Condition, DialogPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { QuestDataTableByDialogSID, rewardFormula } from "./rewardFormula.mjs";
import { deepMerge } from "./deepMerge.mjs";
import { newArmors } from "./armors.util.mjs";
import { getConditions } from "./struct-utils.mjs";

const MALACHITE_BRIBE = rewardFormula(50000).reduce((a, b) => a + b, 0) / 2;

/**
 * Show the correct money reward for repeatable quests
 */
export const transformDialogPrototypes: EntriesTransformer<DialogPrototype> = async (struct) => {
  if (struct.SID === "Malahit_Hub_DialogueOnEntrance_Bribe_62758") {
    return adjustMalahitBribe(struct);
  }
  if (struct.SID === "Malahit_Hub_DialogueOnEntrance_WaitForReply") {
    return adjustMalahitBribeDialogValue(struct);
  }

  if (struct.SID === "RookieVillage_Hub_volk_1_InfoTopic_1_1_62358") {
    const extraStructs: DialogPrototype[] = [];
    const commonProps = {
      DialogChainPrototypeSID: "RookieVillage_Hub_Exchange_Armor_SetDialog",
      DialogMemberIndex: 0,
      Unskippable: false,
      DialogMembersAnimations: new Struct({
        "0": new Struct({
          EmotionalState: "EEmotionalFaceMasks::None",
          LookAtTarget: -1,
          DialogAnimations: new Struct({}),
        }),
        "1": new Struct({
          EmotionalState: "EEmotionalFaceMasks::None",
          LookAtTarget: 0,
          DialogAnimations: new Struct({}),
        }),
      }),
      AKEventName: "VO_volk_RookieVillage_Hub_volk_1_InfoTopic_1_1_62358",
      AKEventSubPath: "Hubs/VO_RookieVillage_Hub/volk/",
      FaceAnimationSubPath: "Hubs/RookieVillage_Hub/volk/",
      FaceAnimationAssetName: "volk_RookieVillage_Hub_volk_1_InfoTopic_1_1_62358",
      HasVOInSequence: false,
      VisibleOnFailedCondition: true,
      MainReply: false,
    };
    const exchangeDialog = new Struct({
      __internal__: {
        isRoot: true,
        rawName: "RookieVillage_Hub_Exchange_Armor_SetDialog_1",
      },
      SID: "RookieVillage_Hub_Exchange_Armor_SetDialog_1",
      ...commonProps,
      NextDialogOptions: new Struct(),
      DialogActions: new Struct({}),
    }) as DialogPrototype;
    const confirmDialog = exchangeDialog.clone();
    confirmDialog.__internal__.rawName = "RookieVillage_Hub_Exchange_Armor_SetDialog_ty";
    confirmDialog.SID = "RookieVillage_Hub_Exchange_Armor_SetDialog_ty";
    confirmDialog.NextDialogOptions.addNode(
      new Struct({
        NextDialogSID: "",
        Terminate: true,
      }),
    );
    extraStructs.push(confirmDialog);

    extraStructs.push(exchangeDialog);
    Object.keys(newArmors)
      .filter((key) => key.endsWith("headless"))
      .forEach((key) => {
        const armor = newArmors[key];
        // Create a dialog option for each armor
        exchangeDialog.NextDialogOptions.addNode(
          new Struct({
            NextDialogSID: exchangeDialog.SID + "_" + armor.SID,
            Terminate: false,
          }),
        );
        const armorDialog = new Struct({
          __internal__: {
            isRoot: true,
            rawName: `RookieVillage_Hub_Exchange_Armor_SetDialog_${armor.SID}`,
          },
          SID: `RookieVillage_Hub_Exchange_Armor_SetDialog_${armor.SID}`,
          ...commonProps,
          NextDialogOptions: new Struct({
            "0": new Struct({
              NextDialogSID: confirmDialog.SID,
              Terminate: false,
            }),
          }),
          DialogActions: new Struct({
            "0": new Struct({
              DialogAction: "EDialogAction::GiveItem",
              DialogActionParam: new Struct({
                VariableType: "EGlobalVariableType::String",
                VariableValue: armor.__internal__.refkey,
              }),
              ItemsCount: new Struct({
                VariableType: "EGlobalVariableType::Int",
                VariableValue: 1,
              }),
              WithEquipped: false,
            }),
            "1": new Struct({
              DialogAction: "EDialogAction::GetItem",
              DialogActionParam: new Struct({
                VariableType: "EGlobalVariableType::String",
                VariableValue: armor.SID,
              }),
              ItemsCount: new Struct({
                VariableType: "EGlobalVariableType::Int",
                VariableValue: 1,
              }),
              WithEquipped: false,
            }),
          }),
          Conditions: getConditions([
            {
              ConditionType: "EQuestConditionType::ItemInInventory",
              ConditionComparance: "EConditionComparance::Equal",
              TargetCharacter: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
              ItemPrototypeSID: new Struct({
                VariableType: "EGlobalVariableType::String",
                VariableValue: armor.SID,
              }),
              ItemsCount: new Struct({
                VariableType: "EGlobalVariableType::Int",
                VariableValue: 1,
              }),
              WithEquipped: true,
              WithInventory: true,
            } as Condition,
          ]),
        }) as DialogPrototype;
        extraStructs.push(armorDialog);
      });

    return extraStructs;
  }

  const fork = adjustQuestRewards(struct);

  if (fork.entries().length) {
    return fork;
  }
};
transformDialogPrototypes.files = [
  "/DialogPrototypes/RSQ10_Dialog_Harpy_RSQ.cfg",
  "/DialogPrototypes/RSQ09_Dialog_Spica_RSQ.cfg",
  "/DialogPrototypes/RSQ08_Dialog_Barmen_RSQ.cfg",
  "/DialogPrototypes/RSQ07_Dialog_Barmen_RSQ.cfg",
  "/DialogPrototypes/RSQ06_Dialog_Sidorovich_RSQ.cfg",
  "/DialogPrototypes/RSQ05_Dialog_Sich_RSQ.cfg",
  "/DialogPrototypes/RSQ04_Dialog_Drabadan_RSQ.cfg",
  "/DialogPrototypes/RSQ01_Dialog_Warlock_RSQ.cfg",
  "/DialogPrototypes/Malahit_Hub_DialogueOnEntrance.cfg",
  "/DialogPrototypes/RookieVillage_Hub_volk_1_InfoTopic_1.cfg",
];

function adjustMalahitBribe(struct: DialogPrototype) {
  const fork = struct.fork();

  return deepMerge(fork, {
    DialogActions: new Struct({ "0": new Struct({ DialogActionParam: new Struct({ VariableValue: MALACHITE_BRIBE }) }) }),
    DialogAnswerActions: new Struct({ "0": new Struct({ DialogActionParam: new Struct({ VariableValue: MALACHITE_BRIBE }) }) }),
    TopicAvailabilityConditions: new Struct({ "0": new Struct({ "0": new Struct({ Money: new Struct({ VariableValue: MALACHITE_BRIBE }) }) }) }),
  }).fork(true);
}

function adjustMalahitBribeDialogValue(struct: DialogPrototype) {
  const fork = struct.fork();
  return deepMerge(fork, {
    NextDialogOptions: new Struct({
      "2": new Struct({ Conditions: new Struct({ 0: new Struct({ 0: new Struct({ Money: new Struct({ VariableValue: MALACHITE_BRIBE }) }) }) }) }),
    }),
  }).fork(true);
}

function adjustQuestRewards(struct: DialogPrototype) {
  const fork = struct.fork();

  const mapper = ([_k, v]) => {
    if (!(v.DialogAction === "EDialogAction::ShowMoney" && typeof v.DialogActionParam === "object")) {
      return;
    }
    const qvs = QuestDataTableByDialogSID[struct.SID];
    if (!qvs) {
      return;
    }
    const DialogActionParam = new Struct({
      VariableValue:
        rewardFormula(
          Math.round(
            qvs.reduce((mem, qvs) => {
              return mem + parseInt(qvs["Suggested Reward"], 10);
            }, 0) / qvs.length,
          ),
        ).reduce((a, b) => a + b, 0) / 2,
    });
    DialogActionParam.__internal__.bpatch = true;
    return Object.assign(v.fork(), { DialogActionParam });
  };

  const DialogActions = struct.DialogActions?.map?.(mapper);
  const DialogAnswerActions = struct.DialogAnswerActions?.map?.(mapper);
  if (DialogActions && DialogActions.entries().length) {
    DialogActions.__internal__.bpatch = true;
    fork.DialogActions = DialogActions;
  }
  if (DialogAnswerActions && DialogAnswerActions.entries().length) {
    DialogAnswerActions.__internal__.bpatch = true;
    fork.DialogAnswerActions = DialogAnswerActions;
  }

  return fork;
}
