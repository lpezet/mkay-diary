import * as program from "commander";
import * as pkg from "../../package.json";
import { createIndexCommand } from "./commands/full";
import { CreateGenerateCommand } from "./commands/embed";
import { CreateEntryCommand } from "./commands/entry";
// import { createLogger } from "./logger";
// const LOGGER = createLogger("main");

import { configureLogger } from "./logger";

configureLogger({
  appenders: {
    console: { type: "console", layout: { type: "colored" } },
  },
  categories: {
    default: { appenders: ["console"], level: "all" },
  },
});

export class Main {
  // constructor() {}
  init(): Promise<any> {
    program
      .version(pkg.version)
      .description("For manual, use man mkay")
      .option("--debug", "Set logger to DEBUG level.");
    // .option(
    //  "-l, --log-level [level]",
    //  "Specify log level: emerg (0), alert (1), crit (2), error (3), warning (4), notice (5), info (6), debug (7)"
    // );
    return CreateGenerateCommand(program)
      .then(createIndexCommand)
      .then(CreateEntryCommand);
  }
  run(args: string[]): program.Command {
    // const opts: program.ParseOptions = new program.ParseOptions();
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    // console.log("# args = " + args);
    return program.parse(args);
  }
}
