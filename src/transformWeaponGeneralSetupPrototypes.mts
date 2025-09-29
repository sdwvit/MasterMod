import { Struct, WeaponGeneralSetupPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { uniqueAttachmentsToAlternatives } from "./basicAttachments.mjs";

/**
 * Enables removing attachments from unique weapons, as well as makes them compatible with ref weapon attachments.
 */
export const transformWeaponGeneralSetupPrototypes: Meta<WeaponGeneralSetupPrototype>["entriesTransformer"] = (entries, context) => {
  let keepo = null;

  Object.values(entries.PreinstalledAttachmentsItemPrototypeSIDs).forEach((e) => {
    if (e?.bHiddenInInventory && uniqueAttachmentsToAlternatives[e?.AttachSID]) {
      keepo = entries;
      e.AttachSID = uniqueAttachmentsToAlternatives[e.entries?.AttachSID];
      e.bHiddenInInventory = false;
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
        Object.entries(
          (context.structsById[context.struct._refkey] as unknown as WeaponGeneralSetupPrototype)?.entries.CompatibleAttachments?.entries || {},
        ) // todo this only scans within the current file, so DLC weapons's ref would be undefined. manually read the base file and add it here if dlc stuff is needed
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
  }

  /* if (!oncePerFile.has(context.filePath)) { // todo this adds a bunch of weapons that are supposed to have attachments on them, as a rarer occasion.
    (context.array as WeaponGeneralSetupPrototypes[]).forEach(({ entries }) => {
      if (entries.CompatibleAttachments) {
        Object.values(entries.CompatibleAttachments.entries).forEach((ca) => {
          if (basicAttachments[ca.entries?.AttachPrototypeSID]) {
            const newSID = entries.SID + "_With_" + ca.entries.AttachPrototypeSID;
            const newWeapon = new (Struct.createDynamicClass(newSID))() as WeaponGeneralSetupPrototypes & WithSID;
            newWeapon.entries = { SID: newSID } as WeaponGeneralSetupPrototypes;
            newWeapon.refkey = entries.SID;
            newWeapon.refurl = context.struct.refurl;
            newWeapon._id = newSID;
            newWeapon.isRoot = true;
            newWeapon.entries.PreinstalledAttachmentsItemPrototypeSIDs = entries.PreinstalledAttachmentsItemPrototypeSIDs;
            //context.extraStructs.push(newWeapon);
            oncePerFile.add(context.filePath);
          }
        });
      }
    });
const oncePerFile = new Set<string>(); // put outside the function so it runs only once per file
  }*/

  return keepo;
};
