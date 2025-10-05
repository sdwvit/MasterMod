import path from "node:path";
import dotEnv from "dotenv";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });

export const rawCfgEnclosingFolder = path.join("Stalker2", "Content", "GameLite");
export const baseCfgDir = path.join(process.env.SDK_PATH, rawCfgEnclosingFolder);

export const projectRoot = path.join(import.meta.dirname, "..");
export const modFolderSteam = path.join(projectRoot, "steamworkshop");
export const modFolderRaw = path.join(projectRoot, "raw");

export const modName = process.env.MOD_NAME;

export const sdkStagedFolder = path.join(process.env.SDK_PATH, "Stalker2", "SavedMods", "Staged");
export const sdkModsFolder = path.join(process.env.SDK_PATH, "Stalker2", "Mods");
