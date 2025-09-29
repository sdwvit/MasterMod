import { DialogPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { REWARD_FORMULA } from "./transformQuestRewardsPrototypes.mjs";

/**
 * Show the correct money reward for repeatable quests
 */
export const transformDialogPrototypes: Meta<DialogPrototype>["entriesTransformer"] = (entries) => {
  let keepo = null;
  [...Object.values(entries.DialogAnswerActions || {}), ...Object.values(entries.DialogActions || {})].forEach((e) => {
    if (e.entries?.DialogAction === "EDialogAction::ShowMoney" && typeof e.entries.DialogActionParam === "object") {
      const minmax = e.entries.DialogActionParam.entries.VariableValue as number;
      e.entries.DialogActionParam.entries.VariableValue = REWARD_FORMULA(minmax, minmax).reduce((a, b) => a + b, 0) / 2;
      keepo = entries;
    }
  });

  return keepo;
};
