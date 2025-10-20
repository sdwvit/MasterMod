import { Struct, WeaponGeneralSetupPrototype } from "s2cfgtojson";
import { scopeDefinitions, uniqueAttachmentsToAlternatives } from "./basicAttachments.mjs";

import { EntriesTransformer, MetaContext } from "./metaType.mjs";

function mapUniqueAttachmentsToGeneric(
  sPAIPSs: Struct & { [p: `${number}`]: Struct & { AttachSID: string; bHiddenInInventory: boolean } },
  fork: WeaponGeneralSetupPrototype,
  struct: WeaponGeneralSetupPrototype,
  context: MetaContext<WeaponGeneralSetupPrototype>,
) {
  if (sPAIPSs?.filter(([k, e]) => !!(e?.bHiddenInInventory && uniqueAttachmentsToAlternatives[e?.AttachSID])).entries().length) {
    const preinstalledAttachmentsItemPrototypeSIDs = sPAIPSs.map(([k, e]) => {
      if (!uniqueAttachmentsToAlternatives[e.AttachSID]) {
        return;
      }
      return Object.assign(e.fork(), {
        AttachSID: uniqueAttachmentsToAlternatives[e.AttachSID],
        bHiddenInInventory: false,
        __internal__: {
          rawName: k,
        },
      });
    });

    if (preinstalledAttachmentsItemPrototypeSIDs.entries().length) {
      fork.PreinstalledAttachmentsItemPrototypeSIDs = preinstalledAttachmentsItemPrototypeSIDs.fork();
      preinstalledAttachmentsItemPrototypeSIDs.entries().forEach(([_k, e]) => {
        fork.PreinstalledAttachmentsItemPrototypeSIDs.addNode(e, e.__internal__.rawName);
      });
      fork.PreinstalledAttachmentsItemPrototypeSIDs.__internal__.bskipref = false;
    }

    if (struct.CompatibleAttachments) {
      const extraCompatibleAttachments = {} as Record<string, WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"]>;
      const existing = grabAttachments(struct, extraCompatibleAttachments);
      const refCompatibleAttachments = grabAttachments(context.structsById[struct.__internal__.refkey], extraCompatibleAttachments);

      const dedup = { ...refCompatibleAttachments, ...extraCompatibleAttachments };

      const existingKeys = new Set(Object.keys(existing));
      for (const k of Object.keys(dedup)) {
        if (existingKeys.has(k)) {
          delete dedup[k];
        }
      }
      fork.CompatibleAttachments = struct.CompatibleAttachments.fork(true);
      Object.values(dedup).forEach((e) => {
        fork.CompatibleAttachments.addNode(e.fork(true), e.AttachPrototypeSID);
      });
      const CompatibleAttachments = fork.CompatibleAttachments.filter((e): e is any => !!dedup[e[1].AttachPrototypeSID]);
      if (CompatibleAttachments.entries().length) {
        CompatibleAttachments.__internal__.bpatch = true;
        fork.CompatibleAttachments = CompatibleAttachments;
      }
    }
  }
}

const en_GoloScope_1 = () => new Struct(scopeDefinitions.EN.EN_GoloScope_1) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"];
const en_X2Scope_1 = () => new Struct(scopeDefinitions.EN.EN_X2Scope_1) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"];
const en_X4Scope_1 = () => new Struct(scopeDefinitions.EN.EN_X4Scope_1) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"];
const en_X8Scope_1 = () => new Struct(scopeDefinitions.EN.EN_X8Scope_1) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"];

/**
 * Enables removing attachments from unique weapons, as well as makes them compatible with ref weapon attachments.
 */
export const transformWeaponGeneralSetupPrototypes: EntriesTransformer<WeaponGeneralSetupPrototype> = (struct, context) => {
  const fork = struct.fork();

  mapUniqueAttachmentsToGeneric(struct.PreinstalledAttachmentsItemPrototypeSIDs, fork, struct, context);

  if (struct.SID === "GunG37_ST") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    const x8Scope = en_X8Scope_1();
    x8Scope.WeaponSpecificIcon = `Texture2D'/Game/GameLite/FPS_Game/UIRemaster/UITextures/Inventory/WeaponAndAttachments/GP37/T_inv_w_gp37_en_x8scope_1.T_inv_w_gp37_en_x8scope_1'`;
    fork.CompatibleAttachments.addNode(x8Scope, "EN_X8Scope_1");
  }

  if (struct.SID === "Gun_Sharpshooter_AR_GS") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(en_GoloScope_1(), "en_GoloScope_1");
    fork.CompatibleAttachments.addNode(en_X4Scope_1(), "en_X4Scope_1");
  }

  if (struct.SID === "Gun_Unknown_AR_GS" || struct.SID === "GunM16_ST" || struct.SID === "Gun_SOFMOD_AR") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(en_X8Scope_1(), "en_X8Scope_1");
  }

  if (!fork.entries().length) {
    return;
  }

  return fork;
};
transformWeaponGeneralSetupPrototypes.files = ["/WeaponGeneralSetupPrototypes.cfg"];
transformWeaponGeneralSetupPrototypes._name = "Make unique weapons moddable";

const grabAttachments = (
  struct: WeaponGeneralSetupPrototype,
  extraCompatibleAttachments: Record<string, WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"]>,
) => {
  if (!struct.CompatibleAttachments) {
    return {};
  }
  return Object.fromEntries(
    struct.CompatibleAttachments.entries().map(([_, v]) => {
      if (uniqueAttachmentsToAlternatives[v.AttachPrototypeSID]) {
        const dummy = v.clone();
        dummy.__internal__.isRoot = false;
        const key = uniqueAttachmentsToAlternatives[v.AttachPrototypeSID];
        dummy.AttachPrototypeSID = key;
        extraCompatibleAttachments[key] = dummy;
      }
      return [v.AttachPrototypeSID, v];
    }),
  );
};
