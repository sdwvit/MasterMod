import { AttachPrototype, Struct } from "s2cfgtojson";
import { EntriesTransformer } from "./metaType.mjs";

const oncePerFile = new Set<string>();
/**
 * Increases the cost of Attachments by 10x.
 */
export const transformAttachPrototypes: EntriesTransformer<AttachPrototype> = (struct, context) => {
  if (struct.Cost) {
    return Object.assign(struct.fork(), { Cost: struct.Cost * 10 });
  }

  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(
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
      }) as AttachPrototype,
    );
  }

  return null;
};

transformAttachPrototypes.files = ["/AttachPrototypes.cfg"];
transformAttachPrototypes._name = "Increase attachment cost by 10x";
