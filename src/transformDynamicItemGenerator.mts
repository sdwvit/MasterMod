import { Entries, GetStructType } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";
import { semiRandom } from "./semi-random.mjs";

const precision = (e) => Math.round(e * 1e3) / 1e3;

/**
 * Does not allow traders to sell gear.
 * Allows NPCs to drop armor.
 * @param entries
 */
export const transformDynamicItemGenerator: Meta["entriesTransformer"] = (entries: DynamicItemGenerator["entries"]) => {
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
                .forEach((pi, _, { length }) => {
                  if (!armorAliasMap[pi.entries.ItemPrototypeSID] && !allArmorAdjustedCost[pi.entries.ItemPrototypeSID]) {
                    return;
                  }
                  let key = pi.entries.ItemPrototypeSID;
                  if (!allArmorAdjustedCost[key]) key = armorAliasMap[key];
                  const zeroToOne = 1 - (allArmorAdjustedCost[key] - minimumArmorCost) / (maximumArmorCost - minimumArmorCost); // 1 means cheapest armor, 0 means most expensive armor
                  const weight = (1 - zeroToOne * 0.14 + 0.01) / length;
                  const chance = zeroToOne * 0.14 + 0.01; // 1% to 15%
                  if (adjustButDontDrop.has(key)) {
                    pi.entries.Weight = precision(weight);
                  } else {
                    /** Drop probability is between 1% and 5% depending on item price; 5% is the cheapest */
                    pi.entries.Chance = precision(chance);
                    pi.entries.Weight = precision(weight);
                    pi.entries.MinDurability = precision(semiRandom(i) * 0.05);
                    pi.entries.MaxDurability = precision(pi.entries.MinDurability + semiRandom(i) * 0.5);
                  }
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
                while (pi.entries.Chance > 0.02) {
                  pi.entries.Chance /= 2;
                }
                pi.entries.Chance = precision(pi.entries.Chance);
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
export const allArmorAdjustedCost = {
  Jemmy_Neutral_Armor: 15037,
  Newbee_Neutral_Armor: 10286,
  Nasos_Neutral_Armor: 20746,
  Zorya_Neutral_Armor: 36429,
  SEVA_Neutral_Armor: 85386,
  Exoskeleton_Neutral_Armor: 171219,
  SkinJacket_Bandit_Armor: 6091,
  Jacket_Bandit_Armor: 9616,
  Middle_Bandit_Armor: 13299,
  Light_Mercenaries_Armor: 22391,
  Exoskeleton_Mercenaries_Armor: 261339,
  Heavy_Mercenaries_Armor: 38523,
  Default_Military_Armor: 12573,
  Heavy2_Military_Armor: 33979,
  Anomaly_Scientific_Armor: 151369,
  HeavyAnomaly_Scientific_Armor: 73079,
  SciSEVA_Scientific_Armor: 72629,
  Rook_Svoboda_Armor: 36260,
  Battle_Svoboda_Armor: 24304,
  SEVA_Svoboda_Armor: 43704,
  Heavy_Svoboda_Armor: 64256,
  HeavyExoskeleton_Svoboda_Armor: 124046,
  Exoskeleton_Svoboda_Armor: 327669,
  Rook_Dolg_Armor: 22907,
  Battle_Dolg_Armor: 20878,
  SEVA_Dolg_Armor: 43964,
  Heavy_Dolg_Armor: 22544,
  HeavyExoskeleton_Dolg_Armor: 96997,
  Exoskeleton_Dolg_Armor: 170259,
  Battle_Monolith_Armor: 43761,
  HeavyAnomaly_Monolith_Armor: 33609,
  HeavyExoskeleton_Monolith_Armor: 209346,
  Exoskeleton_Monolith_Armor: 359076,
  Battle_Varta_Armor: 13495,
  BattleExoskeleton_Varta_Armor: 405369,
  Battle_Spark_Armor: 24322,
  HeavyAnomaly_Spark_Armor: 158133,
  SEVA_Spark_Armor: 48799,
  HeavyBattle_Spark_Armor: 56611,
  Battle_Dolg_End_Armor: 237041,
  NPC_Sel_Armor: 3109,
  NPC_Sel_Neutral_Armor: 1382,
  NPC_Tec_Armor: 1716,
  NPC_Cloak_Heavy_Neutral_Armor: 39127,
  NPC_SkinCloak_Bandit_Armor: 3431,
  NPC_HeavyExoskeleton_Mercenaries_Armor: 34989,
  NPC_Heavy_Military_Armor: 39127,
  NPC_Cloak_Heavy_Military_Armor: 39127,
  NPC_Sci_Armor: 4153,
  NPC_Battle_Noon_Armor: 19446,
  NPC_HeavyAnomaly_Noon_Armor: 39127,
  NPC_HeavyExoskeleton_Noon_Armor: 92005,
  NPC_Exoskeleton_Noon_Armor: 92005,
  NPC_Spark_Armor: 1716,
  NPC_Anomaly_Spark_Armor: 1716,
  NPC_HeavyExoskeleton_Spark_Armor: 92005,
  NPC_Heavy_Corps_Armor: 39127,
  NPC_Heavy2_Coprs_Armor: 39127,
  NPC_Heavy3_Corps_Armor: 39127,
  NPC_Heavy3Exoskeleton_Coprs_Armor: 92005,
  NPC_Exoskeleton_Coprs_Armor: 92005,
  NPC_Richter_Armor: 4153,
  NPC_Korshunov_Armor: 19446,
  NPC_Korshunov_Armor_2: 50540,
  NPC_Dalin_Armor: 4153,
  NPC_Agata_Armor: 4153,
  NPC_Faust_Armor: 4153,
  NPC_Kaymanov_Armor: 4153,
  NPC_Shram_Armor: 34653,
  NPC_Dekhtyarev_Armor: 34653,
  NPC_Sidorovich_Armor: 4153,
  NPC_Barmen_Armor: 4153,
  NPC_Batya_Armor: 4153,
  NPC_Tyotya_Armor: 4153,
  Light_Duty_Helmet: 6876,
  Heavy_Duty_Helmet: 6366,
  Heavy_Svoboda_Helmet: 5898,
  Heavy_Varta_Helmet: 5365,
  Heavy_Military_Helmet: 5719,
  Light_Mercenaries_Helmet: 8941,
  Light_Military_Helmet: 7840,
  Battle_Military_Helmet: 5685,
  Light_Bandit_Helmet: 6786,
  Light_Neutral_Helmet: 6225,
  Anomaly_Scientific_Armor_PSY_preinstalled: 151369,
};

const minimumArmorCost = Object.values(allArmorAdjustedCost).reduce((a, b) => Math.min(a, b), Infinity);
const maximumArmorCost = Object.values(allArmorAdjustedCost).reduce((a, b) => Math.max(a, b), -Infinity);
const adjustButDontDrop = new Set([
  "NPC_Sel_Armor",
  "NPC_Sel_Neutral_Armor",
  "NPC_Tec_Armor",
  "NPC_Cloak_Heavy_Neutral_Armor",
  "NPC_SkinCloak_Bandit_Armor",
  "NPC_HeavyExoskeleton_Mercenaries_Armor",
  "NPC_Heavy_Military_Armor",
  "NPC_Cloak_Heavy_Military_Armor",
  "NPC_Sci_Armor",
  "NPC_Battle_Noon_Armor",
  "NPC_HeavyAnomaly_Noon_Armor",
  "NPC_HeavyExoskeleton_Noon_Armor",
  "NPC_Exoskeleton_Noon_Armor",
  "NPC_Spark_Armor",
  "NPC_Anomaly_Spark_Armor",
  "NPC_HeavyExoskeleton_Spark_Armor",
  "NPC_Heavy_Corps_Armor",
  "NPC_Heavy2_Coprs_Armor",
  "NPC_Heavy3_Corps_Armor",
  "NPC_Heavy3Exoskeleton_Coprs_Armor",
  "NPC_Exoskeleton_Coprs_Armor",
  "NPC_Richter_Armor",
  "NPC_Korshunov_Armor",
  "NPC_Korshunov_Armor_2",
  "NPC_Dalin_Armor",
  "NPC_Agata_Armor",
  "NPC_Faust_Armor",
  "NPC_Kaymanov_Armor",
  "NPC_Shram_Armor",
  "NPC_Dekhtyarev_Armor",
  "NPC_Sidorovich_Armor",
  "NPC_Barmen_Armor",
  "NPC_Batya_Armor",
  "NPC_Tyotya_Armor",
]);

export const armorAliasMap = {
  DutyArmor_3_U1: "Battle_Dolg_Armor",
  Exosekeleton_Neutral_Armor: "Exoskeleton_Neutral_Armor",
  Seva_Dolg_Armor: "SEVA_Dolg_Armor",
  Seva_Neutral_Armor: "SEVA_Neutral_Armor",
  Seva_Svoboda_Armor: "SEVA_Svoboda_Armor",
};
