import { Entries, GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";

/**
 * Does not allow traders to sell gear.
 * Allows NPCs to drop armor.
 * @param entries
 * @param file
 */
export const transformDynamicItemGenerator: Meta["entriesTransformer"] = (entries: DynamicItemGenerator["entries"], { filePath }) => {
  if (!filePath.includes("DynamicItemGenerator.cfg")) {
    return entries;
  }

  /**
   * Does not allow traders to sell gear.
   */
  if (entries.SID.includes("Trade")) {
    Object.values(entries.ItemGenerator.entries)
      .filter((e) => e.entries)
      .forEach((e) => {
        switch (e.entries?.Category) {
          case "EItemGenerationCategory::BodyArmor":
          case "EItemGenerationCategory::Head":
          case "EItemGenerationCategory::WeaponPrimary":
          case "EItemGenerationCategory::WeaponPistol":
          case "EItemGenerationCategory::WeaponSecondary":
            e.entries = { ReputationThreshold: 1000000 } as typeof e.entries;
            break;
          case "EItemGenerationCategory::SubItemGenerator":
            Object.values(e.entries.PossibleItems.entries).forEach((pi) => {
              if (pi.entries?.ItemGeneratorPrototypeSID?.includes("Gun")) {
                pi.entries.Chance = 0; // Disable gun sell
              }
            });
            break;
          default:
            (e.entries as Entries) = {};
            break;
        }
      });
  } else {
    Object.values(entries.ItemGenerator.entries)
      .filter((e) => e.entries)
      .forEach((e, i) => {
        /**
         * Allows NPCs to drop armor.
         */
        switch (e.entries?.Category) {
          case "EItemGenerationCategory::BodyArmor":
            {
              Object.values(e.entries.PossibleItems.entries)
                .filter((pi) => pi.entries)
                .forEach((pi) => {
                  if (!armorAliasMap[pi.entries.ItemPrototypeSID] && !allArmorCosts[pi.entries.ItemPrototypeSID]) {
                    (pi.entries as Entries) = {};
                    return;
                  }
                  pi.entries.Weight ||= 1;
                  pi.entries.MinDurability = 0.01 + (1 / semiRandom(i)) * 0.04;
                  if (allArmorCosts[pi.entries.ItemPrototypeSID]) {
                    pi.entries.Chance = 500 / allArmorCosts[pi.entries.ItemPrototypeSID];
                    pi.entries.MaxDurability = pi.entries.MinDurability + pi.entries.Chance;
                  } else {
                    console.warn(`Unknown armor cost for ${pi.entries.ItemPrototypeSID}, using fallback values.`);

                    pi.entries.Chance = 500 / allArmorCosts[armorAliasMap[pi.entries.ItemPrototypeSID]];
                    pi.entries.MaxDurability = pi.entries.MinDurability + pi.entries.Chance;
                    pi.entries.ItemPrototypeSID ||= armorAliasMap[pi.entries.ItemPrototypeSID];
                  }
                  pi.entries.MinDurability = Math.round(pi.entries.MinDurability * 1e2) / 1e2;
                  pi.entries.MaxDurability = Math.max(0.95, Math.round(pi.entries.MaxDurability * 1e2) / 1e2);
                  pi.entries.Chance = Math.round(pi.entries.Chance * 1e3) / 1e3;
                });
            }
            break;
          /**
           * Control how many consumables are dropped.
           */
          case "EItemGenerationCategory::Ammo":
          case "EItemGenerationCategory::Artifact":
          case "EItemGenerationCategory::Consumable": {
            Object.values(e.entries.PossibleItems.entries)
              .filter((pi) => pi.entries)
              .forEach((pi, j) => {
                pi.entries.Chance = semiRandom(i + j); // Randomize
                while (pi.entries.Chance > 0.05) {
                  pi.entries.Chance **= 2;
                }
                pi.entries.Chance = parseFloat(pi.entries.Chance.toFixed(4));
              });
            break;
          }
          case "EItemGenerationCategory::WeaponPrimary":
          case "EItemGenerationCategory::WeaponPistol":
          case "EItemGenerationCategory::WeaponSecondary":
            Object.values(e.entries.PossibleItems.entries)
              .filter((_) => _.entries)
              .forEach((pi, j) => {
                pi.entries.AmmoMinCount = 0;
                pi.entries.AmmoMaxCount = Math.floor(1 + 5 * semiRandom(i + j));
              });
            break;
          default:
            (e.entries as Entries) = {};
            break;
        }
      });
  }
  if (Object.values(entries.ItemGenerator.entries).every((e) => Object.keys(e.entries || {}).length === 0)) {
    return null;
  }
  return entries;
};

export type DynamicItemGenerator = GetStructType<{
  SID: "GeneralNPC_Neutral_CloseCombat_ItemGenerator";
  ItemGenerator: {
    Category?: string;
    ReputationThreshold?: number;
    PossibleItems?: {
      ItemGeneratorPrototypeSID?: string;
      ItemPrototypeSID: string;
      Weight: number;
      MinDurability: number;
      MaxDurability: number;
      Chance: number;
      AmmoMinCount?: number;
      AmmoMaxCount?: number;
    }[];
  }[];
}>;
export const allArmorCosts = {
  SkinJacket_Bandit_Armor: 17200,
  Light_Duty_Helmet: 12300,
  Heavy_Duty_Helmet: 25800,
  Heavy_Svoboda_Helmet: 32600,
  Heavy_Varta_Helmet: 18000,
  Heavy_Military_Helmet: 36300,
  Light_Mercenaries_Helmet: 19800,
  Light_Military_Helmet: 16100,
  Battle_Military_Helmet: 24700,
  Light_Bandit_Helmet: 7500,
  Light_Neutral_Helmet: 10500,
  Jemmy_Neutral_Armor: 11600,
  Newbee_Neutral_Armor: 13500,
  Jacket_Bandit_Armor: 17200,
  Nasos_Neutral_Armor: 21700,
  Rook_Svoboda_Armor: 17100,
  Rook_Dolg_Armor: 19100,
  Middle_Bandit_Armor: 24000,
  Light_Mercenaries_Armor: 20200,
  Zorya_Neutral_Armor: 36000,
  Anomaly_Scientific_Armor: 39000,
  Default_Military_Armor: 14000,
  Battle_Svoboda_Armor: 36000,
  Battle_Spark_Armor: 41000,
  Battle_Varta_Armor: 37500,
  Battle_Dolg_Armor: 36500,
  Heavy2_Military_Armor: 46000,
  Heavy_Dolg_Armor: 46000,
  Battle_Monolith_Armor: 51000,
  SEVA_Neutral_Armor: 48000,
  Heavy_Mercenaries_Armor: 42500,
  HeavyAnomaly_Scientific_Armor: 52000,
  SEVA_Dolg_Armor: 46000,
  SEVA_Spark_Armor: 50000,
  HeavyBattle_Spark_Armor: 53500,
  HeavyAnomaly_Monolith_Armor: 57500,
  SEVA_Svoboda_Armor: 53000,
  HeavyAnomaly_Spark_Armor: 42500,
  Battle_Dolg_End_Armor: 80000,
  Heavy_Svoboda_Armor: 50000,
  HeavyExoskeleton_Dolg_Armor: 63000,
  SciSEVA_Scientific_Armor: 54000,
  Exoskeleton_Dolg_Armor: 90000,
  HeavyExoskeleton_Svoboda_Armor: 68000,
  Exoskeleton_Neutral_Armor: 65500,
  Exoskeleton_Mercenaries_Armor: 63000,
  BattleExoskeleton_Varta_Armor: 62500,
  HeavyExoskeleton_Monolith_Armor: 69000,
  Exoskeleton_Svoboda_Armor: 95000,
  Exoskeleton_Monolith_Armor: 68000,

  NPC_Sel_Armor: 11600,
  NPC_Sel_Neutral_Armor: 13500,
  NPC_Tec_Armor: 21700,
  NPC_Cloak_Heavy_Neutral_Armor: 36000,
  NPC_SkinCloak_Bandit_Armor: 36000,
  NPC_HeavyExoskeleton_Mercenaries_Armor: 63000,
  NPC_Heavy_Military_Armor: 30000,
  NPC_Cloak_Heavy_Military_Armor: 30000,
  NPC_Sci_Armor: 39000,
  NPC_Battle_Noon_Armor: 10000,
  NPC_HeavyAnomaly_Noon_Armor: 30000,
  NPC_HeavyExoskeleton_Noon_Armor: 90000,
  NPC_Exoskeleton_Noon_Armor: 100000,
  NPC_Spark_Armor: 25000,
  NPC_Anomaly_Spark_Armor: 39000,
  NPC_HeavyExoskeleton_Spark_Armor: 90000,
  NPC_Heavy_Corps_Armor: 31000,
  NPC_Heavy2_Coprs_Armor: 32000,
  NPC_Heavy3_Corps_Armor: 35000,
  NPC_Heavy3Exoskeleton_Coprs_Armor: 90000,
  NPC_Exoskeleton_Coprs_Armor: 85000,
  NPC_Richter_Armor: 37500,
  NPC_Korshunov_Armor: 25000,
  NPC_Korshunov_Armor_2: 130000,
  NPC_Dalin_Armor: 37500,
  NPC_Agata_Armor: 37500,
  NPC_Faust_Armor: 37500,
  NPC_Kaymanov_Armor: 37500,
  NPC_Shram_Armor: 40000,
  NPC_Dekhtyarev_Armor: 40000,
  NPC_Sidorovich_Armor: 37500,
  NPC_Barmen_Armor: 37500,
  NPC_Batya_Armor: 37500,
  NPC_Tyotya_Armor: 37500,
};

export const armorAliasMap = {
  DutyArmor_3_U1: "Battle_Dolg_Armor",
  Exosekeleton_Neutral_Armor: "Exoskeleton_Neutral_Armor",
  Seva_Dolg_Armor: "SEVA_Dolg_Armor",
  Seva_Neutral_Armor: "SEVA_Neutral_Armor",
  Seva_Svoboda_Armor: "SEVA_Svoboda_Armor",
};
