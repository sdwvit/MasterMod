import { Struct } from "s2cfgtojson";

export type MetaContext<T> = {
  fileIndex: number;
  index: number;
  array: T[];
  filePath: string;
  structsById: Record<string, T>;
};
export type EntriesTransformer<T, O = Struct | Struct[] | null> = ((entries: T, context: MetaContext<T>) => Promise<O>) & {
  contains?: true;
  contents?: string[];
  files: string[];
};
export type MetaType<T> = {
  changenote: string;
  description: string;
  structTransformers: EntriesTransformer<T>[];
  onFinish?(): void;
  onTransformerFinish?(transformer: EntriesTransformer<T>): void;
};
