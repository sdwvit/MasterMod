import { GetStructType, Struct } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import WeaponGeneralSetupPrototypes from "../GameLite/GameData/WeaponData/WeaponGeneralSetupPrototypes.cfg";

type WeaponGeneralSetupPrototypes = { _refkey: string | number } & GetStructType<{
  SID: string;
  CompatibleAttachments: {
    AttachPrototypeSID: string;
    Socket: string;
    IconPosX: number;
    IconPosY: number;
    WeaponSpecificIcon: string;
    AimMuzzleVFXSocket: string;
    RequiredUpgradeIDs: string[];
    AdditionalMeshes: {
      MeshPrototypeSID: string;
      Socket: string;
    }[];
  }[];
  PreinstalledAttachmentsItemPrototypeSIDs: {
    AttachSID: string;
    bHiddenInInventory: boolean;
  }[];
  UpgradePrototypeSIDs: string[];
  WeaponStaticMeshParts: {
    MeshPath: string;
    SocketName: string;
    Materials: {
      MaterialPath: string;
      MaterialSlot: number;
    }[];
  }[];
}>;

const uniqueAttachmentsToAlternatives: Record<string, string> = {
  UDP_Deadeye_Colim: "EN_ColimScope_1",
  Gun_Silence_ColimScope: "RU_ColimScope_1",
  Gun_Sledgehummer_GoloScope: "EN_GoloScope_1",
  Gun_Sotnyk_ColimScope: "RU_X2Scope_1",
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
};

/**
 * Enables removing attachments from unique weapons, as well as makes them compatible with ref weapon attachments.
 */
export const transformWeaponGeneralSetupPrototypes: Meta["entriesTransformer"] = (entries: WeaponGeneralSetupPrototypes["entries"], context) => {
  let keepo = null;
  Object.values(entries.PreinstalledAttachmentsItemPrototypeSIDs?.entries || {}).forEach((e) => {
    if (e.entries?.bHiddenInInventory && uniqueAttachmentsToAlternatives[e.entries?.AttachSID]) {
      keepo = entries;
      e.entries.AttachSID = uniqueAttachmentsToAlternatives[e.entries?.AttachSID];
      e.entries.bHiddenInInventory = false;
    }
  });
  if (keepo) {
    if (entries.CompatibleAttachments) {
      const extraCompatibleAttachments = {};

      const currentCompatibleAttachments = Object.fromEntries(
        Object.entries(entries.CompatibleAttachments.entries)
          .filter((e) => e[1].entries)
          .map(([_, v]) => {
            if (uniqueAttachmentsToAlternatives[v.entries.AttachPrototypeSID]) {
              const dummy = new (Struct.createDynamicClass("dummy"))() as typeof v;
              dummy.entries = { ...v.entries };
              dummy.entries.AttachPrototypeSID = uniqueAttachmentsToAlternatives[v.entries.AttachPrototypeSID];
              extraCompatibleAttachments[uniqueAttachmentsToAlternatives[v.entries.AttachPrototypeSID]] = dummy;
            }
            return [v.entries.AttachPrototypeSID, v];
          }),
      );
      const refCompatibleAttachments = Object.fromEntries(
        Object.entries((context.structsById[context.struct._refkey] as WeaponGeneralSetupPrototypes)?.entries.CompatibleAttachments?.entries || {}) // todo this only scans within the current file, so DLC weapons's ref would be undefined. manually read the base file and add it here if dlc stuff is needed
          .filter((e) => e[1].entries)
          .map(([_, v]) => {
            if (uniqueAttachmentsToAlternatives[v.entries.AttachPrototypeSID]) {
              const dummy = new (Struct.createDynamicClass("dummy"))() as typeof v;
              dummy.entries = { ...v.entries };
              dummy.entries.AttachPrototypeSID = uniqueAttachmentsToAlternatives[v.entries.AttachPrototypeSID];
              extraCompatibleAttachments[uniqueAttachmentsToAlternatives[v.entries.AttachPrototypeSID]] = dummy;
            }
            return [v.entries.AttachPrototypeSID, v];
          }),
      );

      const dedup = {
        ...refCompatibleAttachments,
        ...currentCompatibleAttachments,
        ...(extraCompatibleAttachments as typeof currentCompatibleAttachments),
      };

      entries.CompatibleAttachments.entries = Object.fromEntries(Object.values(dedup).map((e, i) => [i, e]));
    }
    delete entries.UpgradePrototypeSIDs;
    delete entries.WeaponStaticMeshParts;
  }
  return keepo;
};
