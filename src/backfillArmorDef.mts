import { ArmorPrototype, Struct } from "s2cfgtojson";
import { allDefaultArmorDefs } from "./consts.mjs";

const defaultKeys = new Set(["__internal__"]);

export function backfillArmorDef<T>(armorT: T, referenceArmor = null): T & ArmorPrototype {
  referenceArmor ||= JSON.parse(
    // @ts-expect-error im lazy to write types here
    JSON.stringify(allDefaultArmorDefs[armorT.__internal__.refkey] || allDefaultArmorDefs.HeavyExoskeleton_Svoboda_Armor),
  );
  const armor = armorT instanceof Struct ? armorT.clone() : JSON.parse(JSON.stringify(armorT));
  const deepWalk = (obj: ArmorPrototype, cb: (s: string[]) => void, path: string[] = []) =>
    Object.entries(obj)
      .filter((e) => !defaultKeys.has(e[0]))
      .forEach(([k, v]) => {
        cb(path.concat(k));
        if (typeof v === "object" && v !== null) {
          deepWalk(v, cb, path.concat(k));
        }
      });
  const get = (obj: any, path: string[]) => path.reduce((o, k) => o && o[k], obj);
  const set = (obj: any, path: string[], value: any) => {
    const lastKey = path.pop();
    const parent = get(obj, path);
    if (parent && lastKey) {
      parent[lastKey] = value;
    }
  };
  deepWalk(referenceArmor, (path: string[]) => {
    let a = armor;
    while (get(a, path) === undefined) {
      a = allDefaultArmorDefs[a.__internal__.refkey];
      if (!a) {
        return;
      }
    }
    set(armor, path, get(a, path));
  });

  return armor;
}
