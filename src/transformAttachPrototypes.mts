import { AttachPrototype, Struct } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

const oncePerFile = new Set<string>();
/**
 * Increases the cost of Attachments by 10x.
 */
export const transformAttachPrototypes: EntriesTransformer<AttachPrototype> = async (struct, context) => {
  const extraStructs: AttachPrototype[] = [];
  const fork = struct.fork();
  if (struct.Cost) {
    fork.Cost = struct.Cost * 10;
  }
  if (struct.CanHoldBreath === false) {
    fork.CanHoldBreath = true;
  }

  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    extraStructs.push(
      new Struct({
        __internal__: {
          rawName: "EN_X16Scope_1",
          isRoot: true,
          refurl: "../AttachPrototypes.cfg",
          refkey: "EN_X8Scope_1",
        },
        SID: "EN_X16Scope_1",
        LocalizationSID: "EN_X8Scope_1",
        Cost: 190000.0,
        Weight: 1.0,
        EffectPrototypeSIDs: new Struct({
          "0": "ScopeIdleSwayXModifierEffect",
          "1": "ScopeIdleSwayYModifierEffect",
          "2": "AimingFOVX16Effect",
          "3": "ScopeAimingTimeNeg20Effect",
          "4": "ScopeAimingMovementNeg10Effect",
          "5": "ScopeRecoilPos20Effect",
        }) as any,
        MeshPrototypeSID: "EN_X16Scope_1",
        Icon: `Texture2D'/Game/GameLite/FPS_Game/UIRemaster/UITextures/Inventory/Attach/T_inv_icon_en_x16scope_1.T_inv_icon_en_x16scope_1'`,
      }) as AttachPrototype,
    );
    extraStructs.push(
      new Struct({
        __internal__: {
          rawName: "UA_X16Scope_1",
          isRoot: true,
          refurl: "../AttachPrototypes.cfg",
          refkey: "RU_X8Scope_1",
        },
        SID: "UA_X16Scope_1",
        ItemGridWidth: 3,
        LocalizationSID: "RU_X8Scope_1",
        Cost: 150000.0,
        Weight: 1.1,
        EffectPrototypeSIDs: new Struct({
          "0": "ScopeIdleSwayXModifierEffect",
          "1": "ScopeIdleSwayYModifierEffect",
          "2": "AimingFOVX16Effect",
          "3": "ScopeAimingTimeNeg20Effect",
          "4": "ScopeAimingMovementNeg10Effect",
          "5": "ScopeRecoilPos20Effect",
        }) as any,
        MeshPrototypeSID: "UA_X16Scope_1",
        Icon: `Texture2D'/Game/_Stalker_2/weapons/attachments/ss/SM_ss01_ua_x16scope_1/T_inv_icon_ua_x16scope.T_inv_icon_ua_x16scope'`,
      }) as AttachPrototype,
    );
  }

  if (fork.entries().length) {
    extraStructs.push(fork);
  }

  return extraStructs;
};

transformAttachPrototypes.files = ["/AttachPrototypes.cfg"];
