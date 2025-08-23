import {
  EChangeValueMode,
  EConditionComparance,
  EDialogAction,
  EEmotionalFaceMasks,
  EGlobalVariableType,
  EQuestConditionType,
  GetStructType,
} from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { REWARD_FORMULA } from "./transformQuestRewardsPrototypes.mjs";

/**
 * Show the correct money reward for repeatable quests
 */
export const transformDialogPrototypes: Meta["entriesTransformer"] = (entries: DialogPrototype["entries"]) => {
  let keepo = null;
  [...Object.values(entries.DialogAnswerActions?.entries || {}), ...Object.values(entries.DialogActions?.entries || {})].forEach((e) => {
    if (e.entries?.DialogAction === "EDialogAction::ShowMoney") {
      const minmax = e.entries.DialogActionParam.entries.VariableValue;
      e.entries.DialogActionParam.entries.VariableValue = REWARD_FORMULA(minmax, minmax).reduce((a, b) => a + b, 0) / 2;
      keepo = entries;
    }
  });

  return keepo;
};

type Condition = {
  ConditionType: EQuestConditionType;
  ConditionComparance: EConditionComparance;
  GlobalVariablePrototypeSID: string;
  ChangeValueMode: EChangeValueMode;
  VariableValue: number;
  LinkedNodePrototypeSID: string;
  CompletedNodeLauncherNames: string[];
};

type DialogPrototype = GetStructType<{
  SID: string;
  DialogChainPrototypeSID: string;
  DialogMemberIndex: number;
  Unskippable: boolean;
  DialogMembersAnimations: {
    EmotionalState: EEmotionalFaceMasks;
    LookAtTarget: number;
    DialogAnimations: string;
  }[];
  AKEventName: string;
  AKEventSubPath: string;
  NextDialogOptions: {
    Conditions: Condition[][];
    AvailableFromStart: boolean;
    VisibleOnFailedCondition: boolean;
    MainReply: boolean;
    AnswerTo: number;
    IncludeBy: string;
    ExcludeBy: string;
    NextDialogSID: string;
    Terminate: boolean;
  }[];
  HasVOInSequence: boolean;
  DialogActions: {
    DialogAction: EDialogAction;
    DialogActionParam: {
      VariableType: EGlobalVariableType;
      VariableValue: number;
    };
  }[];
  DialogAnswerActions: {
    DialogAction: EDialogAction;
    DialogActionParam: {
      VariableType: EGlobalVariableType;
      VariableValue: number;
    };
  }[];
  NodePrototypeVersion: number;
  FaceAnimationSubPath: string;
  FaceAnimationAssetName: string;
  LocalizedSequences: string[];
  LoopSequence: boolean;
  PreblendSequence: boolean;
  PreblendTime: number;
  BlendExpForEaseInOut: number;
  SpeechDuration: number;
  ShowNextDialogOptionsAsAnswers: boolean;
  Conditions: Condition[][];
  VisibleOnFailedCondition: boolean;
  MainReply: boolean;
}>;
