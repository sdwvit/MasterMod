import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";
import { Struct, WeaponGeneralSetupPrototype } from "s2cfgtojson";
import { allDefaultWeaponGeneralSetupPrototypes } from "./consts.mjs";

export const uniqueAttachmentsToAlternatives: Record<string, string> = {
  UDP_Deadeye_Colim: "EN_ColimScope_1",
  Gun_Silence_ColimScope: "RU_ColimScope_1",
  Gun_Sledgehummer_GoloScope: "EN_GoloScope_1",
  // Gun_Sotnyk_ColimScope: "RU_X2Scope_1", // has extra effects, so need to keep it separate and adjust all weapons to be compatible with it
  Sharpshooter_Silen: "EN_Silen_3",
  Gun_Silence_Silen: "RU_Silen_2",
  Sofmod_Silen: "EN_Silen_3",
  //GunDrowned_MagPaired: "GunAK_MagPaired", // removing crashes the game on existing save
  Gun_GStreet_MagIncreased: "GunM10_MagIncreased",
  // Gun_Shakh_MagIncreased: "GunViper_MagIncreased", // removing crashes the game on existing save
  GunPKP_Korshunov_MagLarge: "GunPKP_MagLarge",

  M701_Scope: "EN_X8Scope_1",
  M701_Colim_Scope: "EN_ColimScope_1",
  SVDM_Scope: "RU_X4Scope_1",
  Gvintar_Scope: "RU_X4Scope_1",
  SVU_Scope: "RU_X8Scope_1",

  GunThreeLine_Scope: "GunThreeLine_Scope",
};

export const allCompatibleAttachmentDefsByWeaponGeneralSetupPrototypeSID: Record<
  string,
  Record<string, WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"]>
> = {};

export const allCompatibleAttachmentDefs: Record<string, WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"]> = {
  EN_X16Scope_1: new Struct({
    AttachPrototypeSID: "EN_X16Scope_1",
    Socket: "X16ScopeSocket",
    IconPosX: 60,
    IconPosY: 0,
    AimMuzzleVFXSocket: "X16ScopeMuzzle",
    WeaponSpecificIcon:
      "Texture2D'/Game/GameLite/FPS_Game/UIRemaster/UITextures/Inventory/WeaponAndAttachments/Mark/T_inv_w_mark_en_x8scope_1.T_inv_w_mark_en_x8scope_1'",
  }) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"],

  UA_X16Scope_1: new Struct({
    AttachPrototypeSID: "UA_X16Scope_1",
    Socket: "X16ScopeSocket",
    IconPosX: 60,
    IconPosY: 0,
    AimMuzzleVFXSocket: "X16ScopeMuzzle",
    AimShellShutterVFXSocket: "X2ScopeShells",
    WeaponSpecificIcon:
      "Texture2D'/Game/_Stalker_2/weapons/attachments/ss/SM_ss01_ua_x16scope_1/T_inv_w_gvintar_ua_x16scope_1.T_inv_w_gvintar_ua_x16scope_1'",
  }) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"],

  RU_X8Scope_1: new Struct({
    AttachPrototypeSID: "RU_X8Scope_1",
    Socket: "X8ScopeSocket",
    IconPosX: 60,
    IconPosY: 0,
    AimMuzzleVFXSocket: "X8ScopeMuzzle",
    AimShellShutterVFXSocket: "X2ScopeShells",
    WeaponSpecificIcon:
      "Texture2D'/Game/GameLite/FPS_Game/UIRemaster/UITextures/Inventory/WeaponAndAttachments/SVU/T_inv_w_svu_ru_x8scope_1.T_inv_w_svu_ru_x8scope_1'",
  }) as WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"],
};

allDefaultWeaponGeneralSetupPrototypes.forEach((struct: WeaponGeneralSetupPrototype) => {
  if (struct.CompatibleAttachments) {
    struct.CompatibleAttachments.forEach(([_k, e]) => {
      const newE = e.clone();
      delete newE.BlockingUpgradeIDs;
      delete newE.RequiredUpgradeIDs;

      allCompatibleAttachmentDefsByWeaponGeneralSetupPrototypeSID[struct.SID] ??= {};
      allCompatibleAttachmentDefsByWeaponGeneralSetupPrototypeSID[struct.SID][newE.AttachPrototypeSID] = newE;
      allCompatibleAttachmentDefs[newE.AttachPrototypeSID] = newE;
    });
  }
});
