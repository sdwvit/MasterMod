import path from "node:path";
import childProcess from "node:child_process";
import * as fs from "node:fs";
import dotEnv from "dotenv";

dotEnv.config({ path: path.join(import.meta.dirname, "..", ".env") });
const root = path.join(import.meta.dirname, "..");
const cmd = (name: string) => {
  const packName = `${name}.pak`;

  const destinationPath = path.join(root, "steamworkshop", "Stalker2", "Mods", name, "Content", "Paks", "Windows");
  const rawPath = path.join(root, "raw");
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }
  return [
    process.env.REPAK_PATH,
    "pack",
    rawPath,
    packName,
    `&& mv`,
    packName,
    `'${process.env.STALKER2_MODS_FOLDER}'`,
  ].join(" ");
};

childProcess.execSync(cmd(process.env.MOD_NAME), {
  stdio: "inherit",
  cwd: root,
  shell: "/usr/bin/bash",
});
