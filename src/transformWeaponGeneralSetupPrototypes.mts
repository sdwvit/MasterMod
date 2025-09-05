import { Struct, WeaponGeneralSetupPrototype } from "s2cfgtojson";
import { Meta, WithSIDWithId } from "./prepare-configs.mjs";
import { uniqueAttachmentsToAlternatives } from "./basicAttachments.mjs";
import { perRefUrl919PistolExtensionPack } from "./grabExternalMod.mjs";

const oncePerFile = new Set<string>();
/**
 * Enables removing attachments from unique weapons, as well as makes them compatible with ref weapon attachments.
 */
export const transformWeaponGeneralSetupPrototypes: Meta<WithSIDWithId>["entriesTransformer"] = (
  entries: WeaponGeneralSetupPrototype["entries"],
  context,
) => {
  if (!oncePerFile.has(context.filePath)) {
    oncePerFile.add(context.filePath);
    context.extraStructs.push(...perRefUrl919PistolExtensionPack.WeaponGeneralSetupPrototypes);
  }

  let keepo = null;
  /*  // add more compatible scopes
  if (entries.CompatibleAttachments?.entries) {
    const interestingScopes = Object.values(entries.CompatibleAttachments.entries)
      .filter((e) => basicScopes[e.entries?.AttachPrototypeSID])
      .map((e) => e.entries.AttachPrototypeSID);
    const interestingScopesSet = new Set(interestingScopes);
    const isEN = interestingScopes.some((s) => s.startsWith("EN_"));

    let i = 0;
    while (entries.CompatibleAttachments.entries[i]) i++;
    Object.values(scopeDefinitions[isEN ? "EN" : "nEN"]).forEach((def) => {
      if (!interestingScopesSet.has(def.AttachPrototypeSID)) {
        const newEntry = new (Struct.createDynamicClass("dummy"))() as (typeof entries.CompatibleAttachments.entries)[number];
        newEntry.entries = { ...def } as typeof newEntry.entries;
        entries.CompatibleAttachments.entries[i] = newEntry;
        i++;
        keepo = entries;
      }
    });
  }*/

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
            newWeapon.entries = { SID: newSID } as WeaponGeneralSetupPrototypes["entries"];
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
