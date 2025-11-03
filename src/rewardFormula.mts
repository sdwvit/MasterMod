import { readFileSync } from "node:fs";
import { DIFFICULTY_FACTOR } from "./transformDifficultyPrototypes.mjs";

function parseCsv<T>(csv: string): T[] {
  const lines = csv
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const result = [];
  const headers = lines[0].split("\t").map((header) => header.trim());
  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentline = lines[i].split("\t").map((value) => value.trim());
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
}

export const QuestDataTable = parseCsv<{
  "#": string;
  Vendor: string;
  "Quest idea": string;
  Target: string;
  "Containered Quest SID": string;
  "Dialog SID": string;
  "Spawn NPC Quest Node SID": string;
  "Vanilla ~Reward": string;
  "Cost of travel": string;
  "Suggested Reward": string;
  "Reward Gen SID": string;
}>(readFileSync("./QuestDataTable.tsv", "utf-8"));
export const QuestDataTableByQuestSID = QuestDataTable.reduce(
  (acc, curr) => {
    acc[curr["Containered Quest SID"]] ||= [];
    acc[curr["Containered Quest SID"]].push(curr);
    return acc;
  },
  {} as Record<string, typeof QuestDataTable>,
);
export const QuestDataTableByDialogSID = QuestDataTable.reduce(
  (acc, curr) => {
    acc[curr["Dialog SID"]] ||= [];
    acc[curr["Dialog SID"]].push(curr);
    return acc;
  },
  {} as Record<string, typeof QuestDataTable>,
);

export const SIDRewardMap = {
  RSQ00_reward_var1: 1,
  RSQ00_reward_var2: 2,
  RSQ00_reward_var3: 3,
  RSQ01_reward_var1: 4,
  RSQ01_reward_var2: 5,
  RSQ01_reward_var3: 6,
  RSQ01_reward_var4: 7,
  RSQ04_reward_var1: 8,
  RSQ04_reward_var2: 9,
  RSQ04_reward_var3: 10,
  RSQ04_reward_var4: 11,
  RSQ05_reward_var1: 12,
  RSQ05_reward_var2: 13,
  RSQ05_reward_var3: 14,
  RSQ05_reward_var4: 15,
  RSQ06_reward_var1: 16,
  RSQ06_reward_var2: 17,
  RSQ06_reward_var3: 18,
  RSQ06_reward_var4: 19,
  RSQ07_reward_var1: 20,
  RSQ07_reward_var2: 21,
  RSQ07_reward_var3: 22,
  RSQ08_reward_var1: 23,
  RSQ08_reward_var2: 24,
  RSQ08_reward_var3: 25,
  RSQ09_reward_var1: 26,
  RSQ09_reward_var2: 27,
  RSQ09_reward_var3: 28,
  RSQ10_reward_var1: 29,
  RSQ10_reward_var2: 30,
  RSQ10_reward_var3: 31,
};

const spread = [0.8, 1.2];

export const rewardFormula = (base: number) => spread.map((factor) => Math.round(base * factor * DIFFICULTY_FACTOR));
