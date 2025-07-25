import { GetStructType, Struct } from "s2cfgtojson";

/**
 * Don't allow traders to buy weapons and armor.
 */
export function transformTradePrototypes(entries: TraderEntries, { file }: { file: string }) {
  if (!file.includes("TradePrototypes.cfg")) {
    return entries;
  }
  if (entries.TradeGenerators?.entries) {
    Object.values(entries.TradeGenerators.entries)
      .filter((tg) => tg.entries)
      .forEach((tg) => {
        tg.entries.BuyLimitations ||= new BuyLimitations();
        const existing = Object.values(tg.entries.BuyLimitations.entries);
        if (existing.includes("EItemType::Weapon") && existing.includes("EItemType::Armor")) {
          return;
        }
        ["EItemType::Weapon", "EItemType::Armor"].forEach((itemType) => {
          let i = parseInt(Object.keys(tg.entries.BuyLimitations.entries)[0]) || 0;
          while (tg.entries.BuyLimitations.entries[i] && tg.entries.BuyLimitations.entries[i] !== itemType) {
            i++;
          }
          tg.entries.BuyLimitations.entries[i] = itemType;
        });
      });
    return { TradeGenerators: entries.TradeGenerators };
  }
  return null;
}
export type TraderEntries = GetStructType<{
  SID: "BaseTraderNPC_Template";
  TradeGenerators: {
    BuyLimitations: ("EItemType::Weapon" | "EItemType::Armor")[];
  }[];
}>["entries"];

class BuyLimitations extends Struct {
  _id = "BuyLimitations";
  entries: Record<number, string> = { 0: "EItemType::Weapon", 1: "EItemType::Armor" };
}
