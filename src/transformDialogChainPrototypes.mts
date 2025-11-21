import { DialogChainPrototype, Struct } from "s2cfgtojson";

import { EntriesTransformer } from "./metaType.mjs";

let oncePerTransformer = false;

/**
 */
export const transformDialogChainPrototypes: EntriesTransformer<DialogChainPrototype> = async (struct) => {
  if (!oncePerTransformer) {
    oncePerTransformer = true;
    const vovkExchangeDialog = new Struct({
      __internal__: {
        rawName: "RookieVillage_Hub_Exchange_Armor_SetDialog",
        isRoot: true,
      },
      SID: "RookieVillage_Hub_Exchange_Armor_SetDialog",
      DLC: "None",
      StartingDialogPrototypeSID: "RookieVillage_Hub_Exchange_Armor_SetDialog_1",
      DialogOnTheGo: false,
      CanInterruptByCombat: false,
      CanInterruptByEmission: false,
      ContinueAfterInterrupt: false,
      IsInteractive: false,
      DialogMembers: new Struct({
        "0": new Struct({
          DialogMemberName: "volk_1",
          OptionalMember: false,
        }),
      }),
      IsPCDialogMember: false,
    }) as DialogChainPrototype;
    return [vovkExchangeDialog];
  }
  return null;
};
transformDialogChainPrototypes.files = [];
