import { DialogPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";
import { DialogRewardMap, rewardFormula } from "./rewardFormula.mjs";
import { deepMerge } from "./deepMerge.mjs";

const MALACHITE_BRIBE = 50000;

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
];

transformDialogPrototypes._name = "Show the correct money reward for repeatable quests";

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
    if (v.DialogAction === "EDialogAction::ShowMoney" && typeof v.DialogActionParam === "object") {
      const minmax = DialogRewardMap[struct.SID] as number;
      return Object.assign(v.fork(), {
        DialogActionParam: Object.assign(v.DialogActionParam.fork(), {
          VariableValue: rewardFormula(minmax, minmax).reduce((a, b) => a + b, 0) / 2,
        }),
      });
    }
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
