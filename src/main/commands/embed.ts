import * as program from "commander";
import * as fs from "fs";
import * as path from "path";
import { Config } from "../config";
import { updateSection } from "../update-section";
import { createLogger } from "../logger";
import { Command } from "../command";

const LOGGER = createLogger("command:generate");

export const startTag = (hint?: string): string => {
  return `<!-- ${hint}START mkay-diary -->`;
};

export const endTag = (hint?: string): string => {
  return `<!-- ${hint}END mkay-diary -->`;
};

export class EmbedCommand implements Command {
  config: Config;
  constructor(pConfig: Config) {
    this.config = pConfig;
  }
  name(): string {
    return "embed";
  }
  register(pProg: program.CommanderStatic): Promise<program.CommanderStatic> {
    pProg
      .command("embed [file]")
      .alias("g")
      .description(
        "Embed full diary within .md file if tags present. By default, uses Readme.md."
      )
      .action((file, _options, _command) => {
        LOGGER.debug("Entering [embed] command...");
        return this.execute(file);
      });
    return Promise.resolve(pProg);
  }
  execute(file?: string): Promise<void> {
    file = file ? file : "Readme.md";
    const hint = this.config.hint();
    const sTag = startTag(hint);
    const eTag = endTag(hint);

    const startRegexp = new RegExp(sTag);
    const endRegexp = new RegExp(eTag);
    /*
    const matchesStart = (line: string): boolean => {
      return startRegexp.test(line);
    };
    const matchesEnd = (line: string): boolean => {
      return endRegexp.test(line);
    };
    */
    const inputFile = fs.readFileSync(file, "utf8");

    const diaryFile = path.join(this.config.baseDir(), "full.md");
    // TODO: use stream instead...
    const fullContent = fs.readFileSync(diaryFile, "utf8");

    const section = sTag + "\n\n" + fullContent + "\n" + eTag;
    const finalResult = updateSection(
      inputFile,
      section,
      (line: string): boolean => startRegexp.test(line),
      (line: string): boolean => endRegexp.test(line)
    );
    // console.log("# RESULT:");
    // console.log("####################################################");
    // console.log(finalResult);
    // console.log("####################################################");
    fs.writeFileSync(file, finalResult);
    return Promise.resolve();
  }
}
