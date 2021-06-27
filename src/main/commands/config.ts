import * as program from "commander";
import { Config } from "../config";
import { createLogger } from "../logger";
import { Command } from "../command";

const LOGGER = createLogger("command:config");

export type Question = {
  type: string;
  name: string;
  message: string;
  default?: any;
};

export type Deps = {
  prompt: (questions: Question[]) => Promise<any>;
};

export class ConfigCommand implements Command {
  config: Config;
  deps: Deps;
  constructor(pConfig: Config, deps: Deps) {
    this.config = pConfig;
    this.deps = deps;
  }
  name(): string {
    return "config";
  }
  register(pProg: program.CommanderStatic): Promise<program.CommanderStatic> {
    pProg
      .command("config")
      .alias("c")
      .description("Configure mkay-diary.")
      .action((_options, _command) => {
        return this.execute();
      });
    return Promise.resolve(pProg);
  }
  execute(): Promise<void> {
    LOGGER.debug("Entering Config Command execute()...");
    return this.deps
      .prompt([
        {
          type: "input",
          name: "editor",
          message: `Editor to use for diary entryies. If left blank, will rely on OS-specific ability to open files.`,
          default: () => {
            return this.config.editor();
          },
        },
        {
          type: "confirm",
          name: "include_header",
          message: `Include header when embedding into README file. ary entryies. If left blank, will rely on OS-specific ability to open files.`,
          default: () => {
            return this.config.includeHeader();
          },
        },
        {
          type: "input",
          name: "hint",
          message:
            "Hint to use in tags when embedding diary into README file. If unsure, leave it blank.",
          default: () => {
            return this.config.hint();
          },
        },
      ])
      .then((answers) => {
        // console.log(answers);
        if (answers["editor"]) this.config.setEditor(answers["editor"]);
        if (answers["include_header"])
          this.config.setIncludeHeader(answers["include_header"] === "true");
        if (answers["hint"]) this.config.setHint(answers["hint"]);
      });
  }
}
