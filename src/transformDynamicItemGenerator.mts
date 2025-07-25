import { Entries, GetStructType } from "s2cfgtojson";

const PI = `
  1415926535 8979323846 2643383279 5028841971 6939937510
  5820974944 5923078164 0628620899 8628034825 3421170679
  8214808651 3282306647 0938446095 5058223172 5359408128
  4811174502 8410270193 8521105559 6446229489 5493038196
  4428810975 6659334461 2847564823 3786783165 2712019091
  4564856692 3460348610 4543266482 1339360726 0249141273
  7245870066 0631558817 4881520920 9628292540 9171536436
  7892590360 0113305305 4882046652 1384146951 9415116094
  3305727036 5759591953 0921861173 8193261179 3105118548
  0744623799 6274956735 1885752724 8912279381 8301194912

  9833673362 4406566430 8602139494 6395224737 1907021798
  6094370277 0539217176 2931767523 8467481846 7669405132
  0005681271 4526356082 7785771342 7577896091 7363717872
  1468440901 2249534301 4654958537 1050792279 6892589235
  4201995611 2129021960 8640344181 5981362977 4771309960
  5187072113 4999999837 2978049951 0597317328 1609631859
  5024459455 3469083026 4252230825 3344685035 2619311881
  7101000313 7838752886 5875332083 8142061717 7669147303
  5982534904 2875546873 1159562863 8823537875 9375195778
  1857780532 1712268066 1300192787 6611195909 2164201989

  3809525720 1065485863 2788659361 5338182796 8230301952
  0353018529 6899577362 2599413891 2497217752 8347913151
  5574857242 4541506959 5082953311 6861727855 8890750983
  8175463746 4939319255 0604009277 0167113900 9848824012
  8583616035 6370766010 4710181942 9555961989 4676783744
  9448255379 7747268471 0404753464 6208046684 2590694912
  9331367702 8989152104 7521620569 6602405803 8150193511
  2533824300 3558764024 7496473263 9141992726 0426992279
  6782354781 6360093417 2164121992 4586315030 2861829745
  5570674983 8505494588 5869269956 9092721079 7509302955`.replace(/\s/g, "");

const semiRandom = (index: number) => {
  let value = parseInt(PI.slice(index % PI.length, (index % PI.length) + 10), 10);
  while (value > 1) {
    value /= 10;
  }
  return value;
};

/**
 * Does not allow traders to sell gear.
 * Allows NPCs to drop armor.
 * @param entries
 * @param file
 */
export function transformDynamicItemGenerator(entries: DynamicItemGenerator["entries"], { file }: { file: string }) {
  if (!file.includes("DynamicItemGenerator.cfg")) {
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
                    pi.entries.MaxDurability =
                      pi.entries.MinDurability + 5000 / allArmorCosts[pi.entries.ItemPrototypeSID];
                    pi.entries.Chance = 500 / allArmorCosts[pi.entries.ItemPrototypeSID];
                  } else {
                    console.warn(`Unknown armor cost for ${pi.entries.ItemPrototypeSID}, using fallback values.`);

                    pi.entries.Chance = 500 / allArmorCosts[armorAliasMap[pi.entries.ItemPrototypeSID]];
                    pi.entries.MaxDurability = pi.entries.MinDurability + 10 * pi.entries.Chance;
                    pi.entries.ItemPrototypeSID ||= armorAliasMap[pi.entries.ItemPrototypeSID];
                  }
                  pi.entries.MinDurability = Math.round(pi.entries.MinDurability * 1e5) / 1e5;
                  pi.entries.MaxDurability = Math.round(pi.entries.MaxDurability * 1e5) / 1e5;
                  pi.entries.Chance = Math.round(pi.entries.Chance * 1e5) / 1e5;
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
                pi.entries.Chance += semiRandom(i + j); // Randomize
                while (pi.entries.Chance > 0.01) {
                  pi.entries.Chance /= 10;
                }
                pi.entries.Chance = parseFloat(pi.entries.Chance.toFixed(5));
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
}

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
  Jemmy_Neutral_Armor: 11600,
  Newbee_Neutral_Armor: 13500,
  Nasos_Neutral_Armor: 21700,
  Zorya_Neutral_Armor: 36000,
  SEVA_Neutral_Armor: 48000,
  Exoskeleton_Neutral_Armor: 65500,
  SkinJacket_Bandit_Armor: 17200,
  Jacket_Bandit_Armor: 17200,
  Middle_Bandit_Armor: 24000,
  Light_Mercenaries_Armor: 20200,
  Exoskeleton_Mercenaries_Armor: 63000,
  Heavy_Mercenaries_Armor: 42500,
  Default_Military_Armor: 14000,
  Heavy2_Military_Armor: 46000,
  Anomaly_Scientific_Armor: 39000,
  HeavyAnomaly_Scientific_Armor: 52000,
  SciSEVA_Scientific_Armor: 54000,
  Rook_Svoboda_Armor: 17100,
  Battle_Svoboda_Armor: 36000,
  SEVA_Svoboda_Armor: 53000,
  Heavy_Svoboda_Armor: 50000,
  HeavyExoskeleton_Svoboda_Armor: 68000,
  Exoskeleton_Svoboda_Armor: 95000,
  Rook_Dolg_Armor: 19100,
  Battle_Dolg_Armor: 36500,
  SEVA_Dolg_Armor: 46000,
  Heavy_Dolg_Armor: 46000,
  HeavyExoskeleton_Dolg_Armor: 63000,
  Exoskeleton_Dolg_Armor: 90000,
  Battle_Monolith_Armor: 51000,
  HeavyAnomaly_Monolith_Armor: 57500,
  HeavyExoskeleton_Monolith_Armor: 69000,
  Exoskeleton_Monolith_Armor: 68000,
  Battle_Varta_Armor: 37500,
  BattleExoskeleton_Varta_Armor: 62500,
  Battle_Spark_Armor: 41000,
  HeavyAnomaly_Spark_Armor: 42500,
  SEVA_Spark_Armor: 50000,
  HeavyBattle_Spark_Armor: 53500,
  Battle_Dolg_End_Armor: 80000,
  NPC_Sel_Armor: 3000,
  NPC_Sel_Neutral_Armor: 3000,
  NPC_Tec_Armor: 3000,
  NPC_Cloak_Heavy_Neutral_Armor: 30000,
  NPC_SkinCloak_Bandit_Armor: 17200,
  NPC_HeavyExoskeleton_Mercenaries_Armor: 63000,
  NPC_Heavy_Military_Armor: 30000,
  NPC_Cloak_Heavy_Military_Armor: 30000,
  NPC_Sci_Armor: 3250,
  NPC_Battle_Noon_Armor: 10000,
  NPC_HeavyAnomaly_Noon_Armor: 30000,
  NPC_HeavyExoskeleton_Noon_Armor: 90000,
  NPC_Exoskeleton_Noon_Armor: 100000,
  NPC_Spark_Armor: 2500,
  NPC_Anomaly_Spark_Armor: 2500,
  NPC_HeavyExoskeleton_Spark_Armor: 90000,
  NPC_Heavy_Corps_Armor: 31000,
  NPC_Heavy2_Coprs_Armor: 32000,
  NPC_Heavy3_Corps_Armor: 35000,
  NPC_Heavy3Exoskeleton_Coprs_Armor: 90000,
  NPC_Exoskeleton_Coprs_Armor: 85000,
  NPC_Richter_Armor: 3750,
  NPC_Korshunov_Armor: 25000,
  NPC_Korshunov_Armor_2: 130000,
  NPC_Dalin_Armor: 3750,
  NPC_Agata_Armor: 3750,
  NPC_Faust_Armor: 3750,
  NPC_Kaymanov_Armor: 3750,
  NPC_Shram_Armor: 40000,
  NPC_Dekhtyarev_Armor: 40000,
  NPC_Sidorovich_Armor: 3750,
  NPC_Barmen_Armor: 3750,
  NPC_Batya_Armor: 3750,
  NPC_Tyotya_Armor: 3750,
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
};

export const armorAliasMap = {
  DutyArmor_3_U1: "Battle_Dolg_Armor",
  Exosekeleton_Neutral_Armor: "Exoskeleton_Neutral_Armor",
  Seva_Dolg_Armor: "SEVA_Dolg_Armor",
  Seva_Neutral_Armor: "SEVA_Neutral_Armor",
  Seva_Svoboda_Armor: "SEVA_Svoboda_Armor",
};
