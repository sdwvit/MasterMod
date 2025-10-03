import { DialogPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { REWARD_FORMULA } from "./transformQuestRewardsPrototypes.mjs";

/**
 * Show the correct money reward for repeatable quests
 */
export const transformDialogPrototypes: Meta<DialogPrototype>["entriesTransformer"] = (struct) => {
  let keepo = false;

  const fork = struct.fork();

  const mapper = ([_k, v]) => {
    if (v.DialogAction === "EDialogAction::ShowMoney" && typeof v.DialogActionParam === "object") {
      const minmax = v.DialogActionParam.VariableValue as number;
      keepo = true;
      return Object.assign(v.fork(), {
        DialogActionParam: Object.assign(v.DialogActionParam.fork(), {
          VariableValue: REWARD_FORMULA(minmax, minmax).reduce((a, b) => a + b, 0) / 2,
        }),
      });
    }
  };

  if (keepo) {
    return Object.assign(fork, {
      DialogActions: struct.DialogActions.map(mapper),
      DialogAnswerActions: struct.DialogAnswerActions.map(mapper),
    });
  }
};
