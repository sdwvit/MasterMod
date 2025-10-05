import { EntriesTransformer } from "./metaType.mjs";
import { logger } from "./logger.mjs";
import { getCfgFiles } from "./get-cfg-files.mjs";
import { L2Cache, L2CacheState } from "./l2-cache.mjs";

export async function getFilesForTransformer<T>(transformer: EntriesTransformer<T>): Promise<string[]> {
  if (!transformer?.files?.length) {
    logger.warn(`Transformer ${transformer._name} has no files specified.`);
    return [];
  }
  if (L2Cache[transformer._name]?.length) {
    return L2Cache[transformer._name];
  }
  L2CacheState.needsUpdate = true;
  logger.log(`Getting files for transformer ${transformer._name}...`);
  L2Cache[transformer._name] = (await Promise.all(transformer.files.map((suffix) => getCfgFiles(suffix, transformer.contains)))).flat();
  return L2Cache[transformer._name];
}
