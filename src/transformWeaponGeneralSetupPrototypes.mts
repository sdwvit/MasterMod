import { Struct, WeaponGeneralSetupPrototype } from "s2cfgtojson";
import {
  allCompatibleAttachmentDefs,
  allCompatibleAttachmentDefsByWeaponGeneralSetupPrototypeSID,
  uniqueAttachmentsToAlternatives,
} from "./basicAttachments.mjs";

import { EntriesTransformer, MetaContext } from "./metaType.mjs";

function mapUniqueAttachmentsToGeneric(
  fork: WeaponGeneralSetupPrototype,
  struct: WeaponGeneralSetupPrototype,
  context: MetaContext<WeaponGeneralSetupPrototype>,
) {
  if (struct.PreinstalledAttachmentsItemPrototypeSIDs) {
    fork.PreinstalledAttachmentsItemPrototypeSIDs = struct.PreinstalledAttachmentsItemPrototypeSIDs.filter(
      ([_k, e]) => !!uniqueAttachmentsToAlternatives[e.AttachSID],
    ).map(([_k, e]) => {
      return Object.assign(e.fork(), {
        AttachSID: uniqueAttachmentsToAlternatives[e.AttachSID],
        bHiddenInInventory: false,
      });
    });

    fork.PreinstalledAttachmentsItemPrototypeSIDs.__internal__.bskipref = false;
    fork.PreinstalledAttachmentsItemPrototypeSIDs.__internal__.bpatch = true;

    if (!fork.PreinstalledAttachmentsItemPrototypeSIDs.entries().length) {
      delete fork.PreinstalledAttachmentsItemPrototypeSIDs;
    }
  }

  /**
   * 1. If a weapon has unique attachments, make it also compatible with standard alternatives.
   * 2. Additionally, if a weapon has a parent, use parent's compatible attachments too.
   * 3. Finally, combine them all, avoiding duplicates, and not messing up the keys.
   */
  if (struct.CompatibleAttachments) {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();

    struct.CompatibleAttachments.filter(([_k, e]) => !!uniqueAttachmentsToAlternatives[e.AttachPrototypeSID]).forEach(([_k, e]) => {
      const newKey = uniqueAttachmentsToAlternatives[e.AttachPrototypeSID];
      fork.CompatibleAttachments.addNode(Object.assign(e.clone(), { AttachPrototypeSID: newKey }), newKey);
    });

    if (struct.SID === "Gun_Krivenko_HG_GS") {
      struct.__internal__.refkey = "GunUDP_HG";
    }
    let parent = context.structsById[struct.__internal__.refkey];

    while (parent && parent.CompatibleAttachments) {
      parent.CompatibleAttachments.forEach(([_k, e]) => {
        if (
          !fork.CompatibleAttachments[e.AttachPrototypeSID] &&
          !struct.CompatibleAttachments.entries().find(([_k2, e2]) => e2.AttachPrototypeSID === e.AttachPrototypeSID)
        ) {
          // no reassigning
          const newE = e.clone();
          delete newE.BlockingUpgradeIDs;
          fork.CompatibleAttachments.addNode(newE, e.AttachPrototypeSID);
        }
      });
      parent = context.structsById[parent.__internal__.refkey];
    }

    if (!fork.CompatibleAttachments.entries().length) {
      delete fork.CompatibleAttachments;
    }
  }
}

const getCompatibleAttachmentDefinition = (sid: string) =>
  new Struct(allCompatibleAttachmentDefs[sid]) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"];
const getCompatibleAttachmentDefinitionByWeaponSetupSID = (weaponSid: string, sid: string) =>
  new Struct(
    allCompatibleAttachmentDefsByWeaponGeneralSetupPrototypeSID[weaponSid][sid],
  ) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"];
/**
 * Enables removing attachments from unique weapons, as well as makes them compatible with ref weapon attachments.
 */
export const transformWeaponGeneralSetupPrototypes: EntriesTransformer<WeaponGeneralSetupPrototype> = (struct, context) => {
  const fork = struct.fork();

  mapUniqueAttachmentsToGeneric(fork, struct, context);

  if (struct.SID === "GunG37_ST") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(
      Object.assign(getCompatibleAttachmentDefinition("EN_X8Scope_1"), {
        WeaponSpecificIcon: `Texture2D'/Game/GameLite/FPS_Game/UIRemaster/UITextures/Inventory/WeaponAndAttachments/GP37/T_inv_w_gp37_en_x8scope_1.T_inv_w_gp37_en_x8scope_1'`,
      }),
      "EN_X8Scope_1",
    );
    fork.CompatibleAttachments.addNode(
      Object.assign(getCompatibleAttachmentDefinition("EN_X16Scope_1"), {
        WeaponSpecificIcon: `Texture2D'/Game/GameLite/FPS_Game/UIRemaster/UITextures/Inventory/WeaponAndAttachments/GP37/T_inv_w_gp37_en_x16scope_1.T_inv_w_gp37_en_x16scope_1'`,
      }),
      "EN_X16Scope_1",
    );

    fork.CompatibleAttachments["EN_X8Scope_1"].RequiredUpgradeIDs = new Struct({
      0: "GunG37_Upgrade_Attachment_Rail",
    });
    fork.CompatibleAttachments["EN_X16Scope_1"].RequiredUpgradeIDs = new Struct({
      0: "GunG37_Upgrade_Attachment_Rail",
    });
    return fork;
  }

  if (struct.SID === "GunUDP_Deadeye_HG") {
    fork.UpgradePrototypeSIDs ??= struct.UpgradePrototypeSIDs.fork();
    fork.UpgradePrototypeSIDs.addNode("GunUDP_Upgrade_Attachment_Laser", "GunUDP_Upgrade_Attachment_Laser");
  }
  if (struct.SID === "GunUDP_HG" || struct.SID === "Gun_Krivenko_HG_GS" || struct.SID === "GunUDP_Deadeye_HG") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinition("EN_ColimScope_1"), "EN_ColimScope_1");
    fork.CompatibleAttachments["EN_ColimScope_1"].Socket = "ColimScopeSocket_corrected";
    fork.CompatibleAttachments["EN_ColimScope_1"].WeaponSpecificIcon =
      `Texture2D'/Game/GameLite/FPS_Game/UIRemaster/UITextures/Inventory/WeaponAndAttachments/UDP/T_inv_w_en_colim_scope.T_inv_w_en_colim_scope'`;
  }

  if (struct.SID === "Gun_Sharpshooter_AR_GS") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinitionByWeaponSetupSID("GunM16_ST", "EN_GoloScope_1"), "EN_GoloScope_1");
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinitionByWeaponSetupSID("GunM16_ST", "EN_X4Scope_1"), "EN_X4Scope_1");
    return fork;
  }

  if (struct.SID === "Gun_Unknown_AR_GS" || struct.SID === "GunM16_ST" || struct.SID === "Gun_SOFMOD_AR_GS") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinition("EN_X8Scope_1"), "EN_X8Scope_1");
    return fork;
  }

  if (struct.SID === "GunGvintar_ST" || struct.SID === "Gun_Merc_AR_GS" || struct.SID === "GunLavina_ST" || struct.SID === "Gun_Trophy_AR_GS") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinition("RU_X8Scope_1"), "RU_X8Scope_1");
    fork.CompatibleAttachments["RU_X8Scope_1"].AimMuzzleVFXSocket = "X4ScopeMuzzle";
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinition("UA_X16Scope_1"), "UA_X16Scope_1");
    fork.CompatibleAttachments["UA_X16Scope_1"].AimMuzzleVFXSocket = "X4ScopeMuzzle";
  }

  /*

  if (struct.SID === "GunSVDM_SP" || struct.SID === "Gun_Lynx_SR_GS") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinition("RU_X8Scope_1"), "RU_X8Scope_1");
  }

  if (struct.SID === "Gun_Whip_SR_GS" || struct.SID === "GunSVU_SP") {
    fork.CompatibleAttachments ??= struct.CompatibleAttachments.fork();
    fork.CompatibleAttachments.addNode(getCompatibleAttachmentDefinition("RU_X2Scope_1"), "RU_X2Scope_1");
    fork.CompatibleAttachments["RU_X2Scope_1"].AimMuzzleVFXSocket = "X4ScopeMuzzle";
    fork.CompatibleAttachments["RU_X2Scope_1"].Socket = "X4ScopeSocket";
  }
*/

  if (!fork.entries().length) {
    return;
  }

  return fork;
};
transformWeaponGeneralSetupPrototypes.files = ["/WeaponGeneralSetupPrototypes.cfg"];
transformWeaponGeneralSetupPrototypes._name = "Make unique weapons moddable";
