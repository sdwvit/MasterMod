import { EChangeValueMode, EOverrideDialogTopic, EQuestNodeType, GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Removes timeout for repeating quests.
 */
export const transformQuestNodePrototypes: Meta["entriesTransformer"] = (entries: QuestNodePrototype["entries"]) => {
  if (entries.InGameHours) {
    return { ...entries, InGameHours: 0 };
  }
  return null;
};

type QuestNodePrototype = GetStructType<{
  InGameHours?: number;
  SID: string;
  NodePrototypeVersion: number;
  QuestSID: string;
  NodeType: EQuestNodeType;
  StartDelay: number;
  LaunchOnQuestStart: boolean;

  Repeatable: boolean;
  OutputPinNames: string;
  Launchers: {
    Excluding: boolean;
    Connections: {
      SID: string;
      Name: string;
    };
  };
  LastPhrases: {
    FinishNode: boolean;
    LastPhraseSID: string;
  };
  DialogChainPrototypeSID: string;
  DialogMembers: string;
  TalkThroughRadio: boolean;
  DialogObjectLocation: {
    X: number;
    Y: number;
    Z: number;
  };
  NPCToStartDialog: number;
  StartForcedDialog: boolean;
  WaitAllDialogEndingsToFinish: boolean;
  IsComment: boolean;
  OverrideDialogTopic: EOverrideDialogTopic;
  CanExitAnytime: boolean;
  ContinueThroughRadio: boolean;
  CallPlayer: boolean;
  SeekPlayer: boolean;
  CallPlayerRadius: number;
  ExcludeAllNodesInContainer: boolean;
  GlobalVariablePrototypeSID: string;
  ChangeValueMode: EChangeValueMode;
  VariableValue: 4;
  PinWeights: number[];
}>;
