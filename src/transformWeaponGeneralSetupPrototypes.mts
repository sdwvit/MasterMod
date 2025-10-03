import { WeaponGeneralSetupPrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { uniqueAttachmentsToAlternatives } from "./basicAttachments.mjs";

/**
 * Enables removing attachments from unique weapons, as well as makes them compatible with ref weapon attachments.
 */
export const transformWeaponGeneralSetupPrototypes: Meta<WeaponGeneralSetupPrototype>["entriesTransformer"] = (struct, context) => {
  if (
    !struct.PreinstalledAttachmentsItemPrototypeSIDs?.filter((kv): kv is any => {
      const [_k, e] = kv;
      return !!(e?.bHiddenInInventory && uniqueAttachmentsToAlternatives[e?.AttachSID]);
    }).entries().length
  ) {
    return;
  }

  const fork = struct.fork();
  const PreinstalledAttachmentsItemPrototypeSIDs = struct.PreinstalledAttachmentsItemPrototypeSIDs.map(([_k, e]) => {
    if (!uniqueAttachmentsToAlternatives[e.AttachSID]) {
      return;
    }
    return Object.assign(e.fork(), {
      AttachSID: uniqueAttachmentsToAlternatives[e.AttachSID],
      bHiddenInInventory: false,
    });
  }).fork(true);

  if (PreinstalledAttachmentsItemPrototypeSIDs.entries().length) {
    fork.PreinstalledAttachmentsItemPrototypeSIDs = PreinstalledAttachmentsItemPrototypeSIDs;
  }

  if (struct.CompatibleAttachments) {
    const extraCompatibleAttachments = {};
    const existing = grabAttachments(struct, extraCompatibleAttachments);
    const refCompatibleAttachments = grabAttachments(context.structsById[struct.SID], extraCompatibleAttachments);

    const dedup = {
      ...refCompatibleAttachments,
      ...extraCompatibleAttachments,
    };

    const existingKeys = new Set(Object.keys(existing));
    for (const k of Object.keys(dedup)) {
      if (existingKeys.has(k)) {
        delete dedup[k];
      }
    }
    fork.CompatibleAttachments = struct.CompatibleAttachments.fork(true);
    Object.values(dedup).forEach((e) => {
      fork.CompatibleAttachments.addNode(e);
    });
    const CompatibleAttachments = fork.CompatibleAttachments.filter((e): e is any => !!dedup[e[1].AttachPrototypeSID]);
    if (CompatibleAttachments.entries().length) {
      fork.CompatibleAttachments = CompatibleAttachments;
    }
  }

  if (!fork.PreinstalledAttachmentsItemPrototypeSIDs && !fork.CompatibleAttachments) {
    return;
  }

  return fork;
};

const grabAttachments = (
  struct: WeaponGeneralSetupPrototype,
  extraCompatibleAttachments: Record<string, WeaponGeneralSetupPrototype["CompatibleAttachments"]["0"]>,
) => {
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
