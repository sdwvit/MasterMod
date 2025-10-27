import { GetStructType } from "s2cfgtojson";
import { deepMerge } from "./deepMerge.mjs";

import { EntriesTransformer } from "./metaType.mjs";

type MeshGeneratorPrototype = GetStructType<{
  SID: string;
  Attachments: Record<string, {}>;
  QualityPresetsMeshGenerators: {};
  Materials: {};
  CustomData: {};
}>;

/**
 * Sets bullet (Strike) protection to 0 for all mobs.
 */
export const transformMeshGeneratorPrototypes: EntriesTransformer<MeshGeneratorPrototype> = async (struct, c) => {
  if (struct.SID === "BAN_03_a_MeshGenerator" || struct.SID === "BAN_04_a_MeshGenerator") {
    const fork = struct.fork();
    const newMesh = deepMerge(fork, {
      SID: `${struct.SID}_Player`,
      Attachments: struct.Attachments.filter((e): e is any => e[0] === "BodyArmor" || e[0] === "Clo").map((e) => e[1].fork(true)),
      __internal__: {
        rawName: `${struct.SID}_Player`,
        bpatch: false,
      },
      QualityPresetsMeshGenerators: struct.QualityPresetsMeshGenerators,
      Materials: struct.Materials,
      CustomData: struct.CustomData,
    });
    newMesh.Attachments.__internal__.bpatch = false;
    c.extraStructs.push(newMesh);
  }
  return null;
};

transformMeshGeneratorPrototypes._name = "Add player versions of bandit meshes";
transformMeshGeneratorPrototypes.files = ["/MeshGeneratorPrototypes.cfg"];
