import { CommanderStatic } from "commander";

export interface Command {
  name: () => string;
  register: (prog: CommanderStatic) => Promise<CommanderStatic>;
}
