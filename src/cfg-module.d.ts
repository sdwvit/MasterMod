declare module "*.cfg" {
  import { Struct } from "s2cfgtojson/types.mts";
  export type Config = Struct[];

  export const config: Config;
}
