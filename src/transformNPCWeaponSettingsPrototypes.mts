import { NPCWeaponSettingsPrototype, WeaponGeneralSetupPrototype, WeaponPrototype } from "s2cfgtojson";

import { EntriesTransformer, MetaType } from "./metaType.mjs";
import { readFileAndGetStructs } from "./read-file-and-get-structs.mjs";

const playerWeaponSettingsPrototypesBySID = Object.fromEntries(
  (await readFileAndGetStructs<NPCWeaponSettingsPrototype>("WeaponData/CharacterWeaponSettingsPrototypes/PlayerWeaponSettingsPrototypes.cfg")).map(
    (s) => [s.SID, s],
  ),
);
const weaponPrototypesByNPCSettingsMap = Object.fromEntries(
  (await readFileAndGetStructs<WeaponPrototype>("ItemPrototypes/WeaponPrototypes.cfg"))
    .filter((s) => s.SID !== "UA_GLaunch_Weapon_Data_En" && s.SID !== "UA_GLaunch_Weapon_Data_Ru")
    .map((s) => [s.NPCWeaponAttributes, s]),
);

/**
 * Transforms NPC Weapon Settings Prototypes to set default BaseDamage for Guard NPCs.
 */
export const transformNPCWeaponSettingsPrototypes: EntriesTransformer<NPCWeaponSettingsPrototype> = async (struct, { structsById }) => {
  if (struct.SID.includes("Guard")) {
    let ref = structsById[struct.__internal__.refkey];

    while (
      ref?.BaseDamage >= 50 &&
      (structsById[ref.__internal__.refkey] ?? playerWeaponSettingsPrototypesBySID[ref.__internal__.refkey])?.BaseDamage
    ) {
      ref = structsById[ref.__internal__.refkey] ?? playerWeaponSettingsPrototypesBySID[ref.__internal__.refkey];
    }

    return Object.assign(struct.fork(), { BaseDamage: ref?.BaseDamage });
  }
  if (struct.SID === "GunAK74_Strelok_ST_NPC") {
    return Object.assign(struct.fork(), { BaseDamage: 9, ArmorPiercing: 3 });
  }

  if (weaponPrototypesByNPCSettingsMap[struct.SID]) {
    const weaponPrototype = weaponPrototypesByNPCSettingsMap[struct.SID];
    const playerWeaponSettingsPrototype = playerWeaponSettingsPrototypesBySID[weaponPrototype.PlayerWeaponAttributes];
    if (playerWeaponSettingsPrototype) {
      return Object.assign(
        struct.fork(),
        Object.fromEntries(
          [
            "BaseDamage",
            "ArmorDamage",
            "BaseBleeding",
            "ChanceBleedingPerShot",
            "DispersionRadius",
            "DispersionRadiusMultiplierByDistanceCurve",
            "FireDistanceDropOff",
            "MinBulletDistanceDamageModifier",
            "DistanceDropOffLength",
            "StaggerEffectPrototypeSID",
            "DurabilityDamagePerShot",
            "BulletDropHeight",
            "ArmorPiercing",
          ]
            .map((key) => [key, playerWeaponSettingsPrototype[key]])
            .filter(([_, value]) => !!value),
        ),
      );
    }
  }
};
transformNPCWeaponSettingsPrototypes.files = ["/NPCWeaponSettingsPrototypes.cfg"];
transformNPCWeaponSettingsPrototypes._name = "Set default BaseDamage for Guard NPCs";
