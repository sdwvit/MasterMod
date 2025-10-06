import { DialogPrototype } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";
import { logger } from "./logger.mjs";
import { DialogRewardMap, rewardFormula } from "./rewardFormula.mjs";

/**
 * Show the correct money reward for repeatable quests
 */
export const transformDialogPrototypes: EntriesTransformer<DialogPrototype> = (struct) => {
  let keepo = false;

  const fork = struct.fork();

  const mapper = ([_k, v]) => {
    if (v.DialogAction === "EDialogAction::ShowMoney" && typeof v.DialogActionParam === "object") {
      const minmax = DialogRewardMap[struct.SID] as number;
      keepo = true;
      return Object.assign(v.fork(), {
        DialogActionParam: Object.assign(v.DialogActionParam.fork(), {
          VariableValue: rewardFormula(minmax, minmax).reduce((a, b) => a + b, 0) / 2,
        }),
      });
    }
  };

  const overrides = {
    DialogActions: struct.DialogActions?.map?.(mapper),
    DialogAnswerActions: struct.DialogAnswerActions?.map?.(mapper),
  };
  if (keepo) return Object.assign(fork, overrides);
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
];
transformDialogPrototypes._name = "Show the correct money reward for repeatable quests";
