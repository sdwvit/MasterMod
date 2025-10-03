declare module "*.cfg" {
  import { Struct } from "s2cfgtojson";
  export type Config<T = {}> = Struct & { SID: string } & T;

  export const config: Config;
}
