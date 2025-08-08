import fs from "node:fs";
import { Struct } from "s2cfgtojson";
import { WithSID } from "../../src/prepare-configs.mjs";
import dotEnv from "dotenv";
import path from "node:path";

dotEnv.config({ path: path.join(import.meta.dirname, "..", "..", ".env") });
// scan all local .cfg files
const rootDir = path.join(import.meta.dirname, "..", "..");
const nestedDir = path.join("Stalker2", "Content", "GameLite");
const BASE_CFG_DIR = path.join(process.env.SDK_PATH, nestedDir);
const defaultEntries = new Set(["_isArray", "_useAsterisk"]);

const CharacterWeaponSettingsPrototypes = Struct.fromString<WithSID>(
  fs.readFileSync(path.join(BASE_CFG_DIR, "GameData", "WeaponData", "CharacterWeaponSettingsPrototypes.cfg")).toString(),
);
const NPCWeaponSettingsPrototypes = Struct.fromString<WithSID>(
  fs
    .readFileSync(path.join(BASE_CFG_DIR, "GameData", "WeaponData", "CharacterWeaponSettingsPrototypes", "NPCWeaponSettingsPrototypes.cfg"))
    .toString(),
);
const PlayerWeaponSettingsPrototypes = Struct.fromString<WithSID>(
  fs
    .readFileSync(path.join(BASE_CFG_DIR, "GameData", "WeaponData", "CharacterWeaponSettingsPrototypes", "PlayerWeaponSettingsPrototypes.cfg"))
    .toString(),
);

function get<T extends Struct>(obj: T, path: `${string}.${string}` | string, lookup: Record<string, T>) {
  const p = path.split(".");
  let v: Struct | string = undefined;

  let c = obj;
  while (v === undefined && c) {
    v = p.reduce((o, i) => (o || {})[i], c.entries);
    c = lookup[c.refkey];
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

const props = [
  ...new Set([
    ...CharacterWeaponSettingsPrototypes.map((e) => Object.keys(e.entries)).flat(),
    ...NPCWeaponSettingsPrototypes.map((e) => Object.keys(e.entries)).flat(),
    ...PlayerWeaponSettingsPrototypes.map((e) => Object.keys(e.entries)).flat(),
  ]),
];
const PlayerWeaponSettingsPrototypesObj = Object.fromEntries(PlayerWeaponSettingsPrototypes.map((e) => [e.entries.SID, e]));
const NPCWeaponSettingsPrototypesObj = Object.fromEntries(NPCWeaponSettingsPrototypes.map((e) => [e.entries.SID, e]));
const CharacterWeaponSettingsPrototypesObj = Object.fromEntries(CharacterWeaponSettingsPrototypes.map((e) => [e.entries.SID, e]));
const TogetherObj = [
  Object.values(PlayerWeaponSettingsPrototypesObj),
  Object.values(NPCWeaponSettingsPrototypesObj),
  Object.values(CharacterWeaponSettingsPrototypesObj),
]
  .flat(1)
  .reduce((acc, e) => {
    acc[e.entries.SID] ||= e;
    Object.entries(e.entries).forEach(([k, v]) => {
      if (defaultEntries.has(k)) return;
      if (acc[e.entries[k]]) {
        if (acc[e.entries.SID].entries[k] !== v) {
          console.warn(`Duplicate key found: ${e.entries.SID}.${k}`);
        }
      } else {
        acc[e.entries.SID].entries[k] = v;
      }
    });
    return acc;
  }, {});

const header = props.map((p) => p.split(".").slice(-1).join(""));
const sep = props.map((_) => ["-"]).flat();
const content = [
  ...Object.values(PlayerWeaponSettingsPrototypesObj).map((s) => props.map((p) => get(s, p, TogetherObj))),
  ...Object.values(NPCWeaponSettingsPrototypesObj).map((s) => props.map((p) => get(s, p, TogetherObj))),
];
const mkdn = [header, sep, ...content].map((e) => `| ${e.join(" | ")} |`).join("\n");

console.log(mkdn);
