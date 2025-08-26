import { Struct, TradePrototype } from "s2cfgtojson";
import { Meta } from "./prepare-configs.mjs";

/**
 * Don't allow traders to buy weapons and armor.
 */
export const transformTradePrototypes: Meta["entriesTransformer"] = (entries: TradePrototype["entries"]) => {
  if (entries.TradeGenerators?.entries) {
    Object.values(entries.TradeGenerators.entries)
      .filter((tg) => tg.entries)
      .forEach((tg) => {
        tg.entries.BuyLimitations ||= new BuyLimitations() as any;
        const existing = Object.values(tg.entries.BuyLimitations.entries);
        if (existing.includes("EItemType::Weapon") && existing.includes("EItemType::Armor")) {
          return;
        }
        ["EItemType::Weapon", "EItemType::Armor"].forEach((itemType) => {
          let i = parseInt(Object.keys(tg.entries.BuyLimitations.entries)[0]) || 0;
          while (tg.entries.BuyLimitations.entries[i] && tg.entries.BuyLimitations.entries[i] !== itemType) {
            i++;
          }
          tg.entries.BuyLimitations.entries[i] = itemType as any;
        });
      });
    return { TradeGenerators: entries.TradeGenerators };
  }
  return null;
};

class BuyLimitations extends Struct {
  _id = "BuyLimitations";
  entries: Record<number, string> = { 0: "EItemType::Weapon", 1: "EItemType::Armor" };
}
