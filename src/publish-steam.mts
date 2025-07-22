import path from "node:path";
import childProcess from "node:child_process";
import * as fs from "node:fs";
import * as VDF from "@node-steam/vdf";

import dotEnv from "dotenv";
await import("./pull-staged.mjs");
dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const MODS_PATH = path.join(import.meta.dirname, "..");
const STALKER_STEAM_ID = "1643320";
import { meta } from "./meta.mjs";

const sanitize = (str: string) => str.replace(/\n/g, "\\n").replace(/"/g, '\\"');

const cmd = (name: string) => {
  const vdfFilePath = path.join(import.meta.dirname, `workshopitem.vdf`);
  const vdfData = fs.existsSync(vdfFilePath) ? VDF.parse(fs.readFileSync(vdfFilePath, "utf8")) : { workshopitem: {} };

  vdfData.workshopitem.appid = STALKER_STEAM_ID;
  vdfData.workshopitem.publishedfileid ||= "0"; // This will be set by SteamCMD
  vdfData.workshopitem.contentfolder = path.join(MODS_PATH, "steamworkshop");
  vdfData.workshopitem.previewfile = path.join(MODS_PATH, "512.png");
  vdfData.workshopitem.title = sanitize(`${process.env.MOD_NAME.replace(/([A-Z])/g, "$1")} by sdwvit`);
  vdfData.workshopitem.description = sanitize(meta.description);
  vdfData.workshopitem.changenote = sanitize(meta.changenote);

  fs.writeFileSync(vdfFilePath, VDF.stringify(vdfData), "utf8");

  return [
    process.env.STEAMCMD_PATH,
    "+login",
    `"${process.env.STEAM_USER}"`,
    `"${process.env.STEAM_PASS}"`,
    "+workshop_build_item",
    `"${vdfFilePath}"`,
    "+quit",
  ].join(" ");
};

childProcess.execSync(cmd(process.env.MOD_NAME), {
  stdio: "inherit",
  cwd: MODS_PATH,
  shell: "/usr/bin/bash",
  env: process.env,
});
