import fs from "node:fs";
import { Struct } from "s2cfgtojson";
import { WithSID } from "../../src/prepare-configs.mjs";
import dotEnv from "dotenv";
import path from "node:path";

dotEnv.config({ path: path.join(import.meta.dirname, "..", "..", ".env") });

const nestedDir = path.join("Stalker2", "Content", "GameLite");
const BASE_CFG_DIR = path.join(process.env.SDK_PATH, nestedDir);
const defaultEntries = new Set(["_isArray", "_useAsterisk"]);

function get<T extends Struct>(obj: T, path: `${string}.${string}` | string, lookup: Record<string, T>) {
  const p = path.split(".");
  let v: Struct | string = undefined;

  let c = obj;
  while (v === undefined && c) {
    v = p.reduce((o, i) => (o || {})[i], c.entries);
    c = lookup[String(c.refkey).replace(/_Player/, "")] || lookup[c.refkey];
  }
  const flatten = (v: Struct | string): Struct | string => {
    if (v instanceof Struct) {
      return Object.entries(v.entries || {})
        .filter(([k]) => !defaultEntries.has(k))
        .map(([_, e]) => (e instanceof Struct ? flatten(e) : e))
        .join(", ");
    }
    return v;
  };
  return flatten(v);
}
const cleanSID = (s) => s.replace(/(_Player(_WS)?|_GS)$/, "");

const deepMerge = (target, source, preferLeft = true) => {
  if (typeof target !== "object" || typeof source !== "object") {
    return source;
  }
  for (const key of Object.keys(source)) {
    if (key in target) {
      target[key] = deepMerge(target[key], source[key]);
    } else {
      if (preferLeft) {
        target[key] ||= source[key];
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};
const getDeepKeys = (e: Struct, ignoreProps: Set<string>, parentKey?: string) => {
  if (!e.entries) {
    return [];
  }
  return [...new Set(Object.keys(e.entries)).difference(ignoreProps)].flatMap((k) => {
    if (e.entries[k] instanceof Struct) {
      //return getDeepKeys(e.entries[k], ignoreProps, parentKey.length > 1 ? `${parentKey}.${k}` : k);
    }
    return parentKey ? `${parentKey}.${k}` : k;
  });
};

function processOne(name: string, inflowStr: string[][], ignoreProps: Set<string> = new Set(), replacer = (e: string) => e) {
  const inflow = inflowStr.map((e) => Struct.fromString<WithSID>(fs.readFileSync(path.join(BASE_CFG_DIR, "GameData", ...e)).toString()));
  const inflowBySID = inflow.map((e) => Object.fromEntries(e.map((s) => [s.entries.SID, s])));
  const props = [...new Set(inflow.map((e) => e.map((k) => getDeepKeys(k, ignoreProps))).flat(5))];

  const Lookup = inflowBySID
    .map((e) => Object.values(e))
    .flat(1)
    .reduce(
      (acc, e) => {
        const key = cleanSID(e.entries.SID);
        acc[key] ||= e;
        deepMerge(acc[key].entries, e.entries);
        return acc;
      },
      {} as (typeof inflowBySID)[number],
    );

  const header = props.map((p) => p.split(".").slice(-1).join(""));
  const sep = props.map((_) => ["-"]).flat();
  const content = Object.values(Lookup).map((s) => props.map((p) => get(s, p, Lookup)));
  const mkdn = [header, sep, ...content].map((e) => `| ${e.join(" | ")} |`).join("\n");

  fs.writeFileSync(path.join(import.meta.dirname, `${name}.md`), replacer(mkdn));
}
const cases: Record<string, { inflow: string[][]; ignoreProps?: Set<string>; replacer?: (n: string) => string }> = {
  armor: {
    inflow: [["ItemPrototypes", "ArmorPrototypes.cfg"]],
    ignoreProps: new Set([
      "Type",
      "Icon",
      "ItemGridWidth",
      "ItemGridHeight",
      "MaxStackCount",
      "IncreaseSpeedCoef",
      "NoiseCoef",
      "ArmorSoundType",
      "StaggerEffectPrototypeSID",
      "UpgradePrototypeSIDs",
      "MeshGenerator",
      "NpcMeshGenerator",
      "VoiceModulatorSID",
      "ItemTypeSwitchValue",
      "PhysicsInteractionPrototypeSID",
      "PreinstalledUpgrades",
      "SectionSettings",
      "MeshPrototypeSID",
      "Invisible",
      "LocalizationSID",
    ]),
    replacer: (e: string) => e.replaceAll(/(\w+::)|(\/\/[^|]+)|(\{bskipref})/g, ""),
  },
  weapons: {
    inflow: [
      ["WeaponData", "CharacterWeaponSettingsPrototypes.cfg"],
      ["WeaponData", "CharacterWeaponSettingsPrototypes", "NPCWeaponSettingsPrototypes.cfg"],
      ["WeaponData", "CharacterWeaponSettingsPrototypes", "PlayerWeaponSettingsPrototypes.cfg"],
      ["WeaponData", "WeaponGeneralSetupPrototypes.cfg"],
      ["ItemPrototypes", "WeaponPrototypes.cfg"],
    ],
    ignoreProps: new Set([
      "AlwaysPierce",
      "ImpulseToObjects",
      "UnequippedSocketName",
      "UnequippedRelativeTranslation",
      "UnequippedRelativeRotation",
      "StealthReveal",
      "DispersionRadiusMultiplierByDistanceCurve",
      "CombatSynchronizationScore",
      "WeaponDurabilityCurve",
      "AimVFXSocketMinAlpha",
      "AimingCurve",
      "AimingEffects",
      "ShootingAnimationNumberToSkip",
      "CameraRecoilPatternPath",
      "CameraRecoilPatternBlendCurve",
      "RecoilParams",
      "DispersionParams",
      "ShootCameraShakePrototypeSID",
      "SpeedCoef",
      "ProjectileSpawnOffset",
      "AdditionalBulletsAfterReloadingCount",
      "WeaponReloadTimePerAttachment",
      "CompatibleAttachments",
      "FireEventOneShot",
      "FireEventLoop",
      "FireEventBreak",
      "WeaponTypeSoundSwitch",
      "LastBulletInClipEvent",
      "WeaponJamEvent",
      "ItemTypeSwitchValue",
      "WeaponInWorldUnloadSound",
      "AimingSound",
      "SilencerRTPCParameter",
      "FireIntervalRTPCParameter",
      "MechModulatorRTPCParameter",
      "DisplayBP",
      "DefaultEjectMagazineSocketName",
      "DefaultInsertMagazineSocketName",
      "BulletsSockets",
      "BulletMeshPath",
      "LastClipBulletsCount",
      "LastTotalBulletsCount",
      "LastClipBulletsDamageModifier",
      "LastTotalBulletsDamageModifier",
      "HipMouseAimAssistPresetSID",
      "HipGamepadAimAssistPresetSID",
      "AimMouseAimAssistPresetSID",
      "AimGamepadAimAssistPresetSID",
      "WeaponStaticMeshParts",
      "Type",
      "MaxStackCount",
      "MeleeWeaponSID",
      "MeshPrototypeSID",
      "MeshInWorldPrototypeSID",
      "GeneralWeaponSetup",
      "PlayerWeaponAttributes",
      "NPCWeaponAttributes",
      "ItemGridWidth",
      "ItemGridHeight",
      "PhysicsInteractionPrototypeSID",
      "Icon",
      "SectionSettings",
      "LocalizationSID",
      "IsQuestItem",
    ]),
    replacer: (e: string) => e.replaceAll(/NPCWeapon(\w+)Stagger/g, "$1 Stagger").replaceAll(/(\w+::)|(\/\/[^|]+)|(\{bskipref})/g, ""),
  },
};

Object.entries(cases).forEach(([name, { inflow, ignoreProps, replacer }]) => processOne(name, inflow, ignoreProps, replacer));
