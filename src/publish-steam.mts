import path from "node:path";
import childProcess from "node:child_process";
import * as fs from "node:fs";
import * as VDF from "@node-steam/vdf";
import "./ensureDotEnv.mts";

await import("./pull-staged.mjs");
import { meta } from "./meta.mjs";
import { spawnSync } from "child_process";
import { modName, projectRoot } from "./base-paths.mjs";

const STALKER_STEAM_ID = "1643320";

const sanitize = (str: string) => str.replace(/\n/g, "").replace(/"/g, '\\"');

const cmd = () => {
  const vdfFilePath = path.join(import.meta.dirname, `workshopitem.vdf`);
  const vdfData = fs.existsSync(vdfFilePath) ? VDF.parse(fs.readFileSync(vdfFilePath, "utf8")) : { workshopitem: {} };

  vdfData.workshopitem.appid = STALKER_STEAM_ID;
  vdfData.workshopitem.publishedfileid ||= "0"; // This will be set by SteamCMD
  vdfData.workshopitem.contentfolder = path.join(projectRoot, "steamworkshop");
  vdfData.workshopitem.previewfile = path.join(projectRoot, "512.png");
  vdfData.workshopitem.title = sanitize(`${modName.replace(/([A-Z])/g, " $1").trim()} by sdwvit`);
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

childProcess.execSync(cmd(), {
  stdio: "inherit",
  cwd: projectRoot,
  shell: "/usr/bin/bash",
  env: process.env,
});

spawnSync("paplay", ["./pop.wav"]);
