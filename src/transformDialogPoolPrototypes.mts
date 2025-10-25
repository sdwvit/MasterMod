import { DialogPoolPrototype } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";
/**
 * Transforms DialogPoolPrototype structs to replace "SpeakToLeader" dialog events with "Hello" topics.
 */
export const transformDialogPoolPrototypes: EntriesTransformer<DialogPoolPrototype> = (struct, context) => {
  if (struct.DialogEventType === "EDialogEventType::Interact_SpeakToLeader") {
    const fork = struct.fork();
    fork.AvailableDialogs = struct.AvailableDialogs.fork(true).map(([_, dialog]) => speakToLeaderToHelloTopicsMap[dialog] || dialog);
    fork.DialogEventType = "EDialogEventType::Interact_Neutral";
    return fork;
  }

  return null;
};
transformDialogPoolPrototypes._name = 'Transforms DialogPoolPrototype structs to replace "SpeakToLeader" dialog events with "Hello" topics.';
transformDialogPoolPrototypes.files = [
  "/GroupAgnostic_Army.cfg",
  "/GroupAgnostic_Bandits.cfg",
  "/GroupAgnostic_FreeStalkers.cfg",
  "/GroupAgnostic_Monolith.cfg",
]; // filler

const speakToLeaderToHelloTopicsMap = {
  General_freestalkers_0_NPC_Interact_SpeakToLeader: "General_freestalkers_0_NPC_Interact_Neutral",
  General_freestalkers_0_NPC_Interact_SpeakToLeader_2: "General_freestalkers_0_NPC_Interact_Neutral_2",
  General_army_0_NPC_Interact_SpeakToLeader: "General_army_0_NPC_Interact_Neutral",
  General_army_0_NPC_Interact_SpeakToLeader_2: "General_army_0_NPC_Interact_Neutral_2",
  General_bandits_0_NPC_Interact_SpeakToLeader: "General_bandits_0_NPC_Interact_Neutral",
  General_bandits_0_NPC_Interact_SpeakToLeader_2: "General_bandits_0_NPC_Interact_Neutral_2",
  General_monolith_0_NPC_Interact_SpeakToLeader: "General_monolith_0_NPC_Interact_Neutral",
  General_monolith_0_NPC_Interact_SpeakToLeader_2: "General_monolith_0_NPC_Interact_Neutral_2",
};
