import * as program from "commander";
import * as pkg from "../../package.json";
import { FullCommand } from "./commands/full";
import { EmbedCommand } from "./commands/embed";
import { EntryCommand } from "./commands/entry";
// import { createLogger } from "./logger";
// const LOGGER = createLogger("main");

import { configureLogger } from "./logger";
import { BaseConfig, Config } from "./config";
import { Command } from "./command";

configureLogger({
  appenders: {
    console: { type: "console", layout: { type: "colored" } },
  },
  categories: {
    default: { appenders: ["console"], level: "all" },
  },
});

export class Main {
  config: Config;
  constructor(config?: Config) {
    this.config = config ? config : new BaseConfig();
  }
  init(): Promise<any> {
    program
      .version(pkg.version)
      .description("For manual, use man mkay")
      .option("--debug", "Set logger to DEBUG level.");
    // .option(
    //  "-l, --log-level [level]",
    //  "Specify log level: emerg (0), alert (1), crit (2), error (3), warning (4), notice (5), info (6), debug (7)"
    // );
    const commands: Command[] = [
      new EntryCommand(this.config),
      new EmbedCommand(this.config),
      new FullCommand(this.config),
    ];
    const registrations: Promise<program.CommanderStatic>[] = [];
    commands.forEach((c) => {
      registrations.push(c.register(program));
    });
    return Promise.all(registrations);
  }
  run(args: string[]): program.Command {
    // const opts: program.ParseOptions = new program.ParseOptions();
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    // console.log("# args = " + args);
    return program.parse(args);
  }
}
