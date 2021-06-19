import * as program from "commander";

export interface Command {
  register: (prog: program.CommanderStatic) => Promise<program.CommanderStatic>;
}
