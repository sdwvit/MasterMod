declare module "*.cfg" {
  import { Struct } from "s2cfgtojson/types.mts";
  export type Config<T = {}> = Struct<{ SID: string } & T>;

  export const config: Config;
}
