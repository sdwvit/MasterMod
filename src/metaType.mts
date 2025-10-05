import { Struct } from "s2cfgtojson";

export type MetaContext<T> = {
  fileIndex: number;
  index: number;
  array: T[];
  extraStructs: T[];
  filePath: string;
  structsById: Record<string, T>;
};
export type EntriesTransformer<T> = ((entries: T, context: MetaContext<T>) => Struct | null) & {
  contains?: true;
  contents?: string[];
  _name: string;
  files: string[];
};
export type MetaType<T> = {
  changenote: string;
  description: string;
  structTransformers: EntriesTransformer<T>[];
  onFinish?(): void;
};
