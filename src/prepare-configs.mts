import * as fs from "node:fs";
import { meta } from "./meta.mts";
import { spawnSync } from "child_process";
import { modFolderRaw, modFolderSteam } from "./base-paths.mjs";
import { getCfgFileProcessor } from "./get-cfg-file-processor.mjs";
import { logger } from "./logger.mjs";
import { onL2Finish } from "./l2-cache.mjs";
import { onL3Finish } from "./l3-cache.mjs";
import { onL1Finish } from "./l1-cache.mjs";
import { getFilesForTransformer } from "./create-cfg-file-selector-for-transformer.mjs";

console.time();
// if (fs.existsSync(modFolderRaw)) fs.rmSync(modFolderRaw, { recursive: true, force: true });
if (!fs.existsSync(modFolderSteam)) fs.mkdirSync(modFolderSteam, { recursive: true });

const total = await Promise.all(
  meta.structTransformers
    .map(async (transformer) => {
      const [files, processor] = await Promise.all([getFilesForTransformer(transformer), getCfgFileProcessor(transformer)] as const);

      const res = await Promise.all(files.map(processor));
      meta.onTransformerFinish?.(transformer);
      return res;
    })
    .flat(),
);

meta.onFinish?.();
console.timeEnd();

logger.log(`Total: ${total.length} transformers processed.`);
const writtenFiles = total.filter((s) => s?.length > 0);
logger.log(`Total: ${writtenFiles.flat().length} structs in ${writtenFiles.length} files written.`);
//await import("./packmod.mjs");
await import("./push-to-sdk.mts");
await import("./update-readme.mjs");
await onL1Finish();
await onL2Finish();
await onL3Finish();
spawnSync("paplay", ["./pop.wav"]);
