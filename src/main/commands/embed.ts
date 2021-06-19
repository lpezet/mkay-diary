import * as program from "commander";
import * as fs from "fs";
import * as path from "path";
import { Config } from "../config";
import { updateSection } from "../update-section";
import { createLogger } from "../logger";

const LOGGER = createLogger("command:generate");
export const embed = (file?: string): Promise<void> => {
  file = file ? file : "Readme.md";
  const hint = Config.hint();
  const START_TAG = `<!-- ${hint}START mkay-diary -->`;
  const END_TAG = `<!-- ${hint}END mkay-diary -->`;

  const startRegexp = new RegExp(START_TAG);
  const endRegexp = new RegExp(END_TAG);
  const matchesStart = (line: string): boolean => {
    return startRegexp.test(line);
  };
  const matchesEnd = (line: string): boolean => {
    return endRegexp.test(line);
  };
  const inputFile = fs.readFileSync(file, "utf8");

  const diaryFile = path.join(Config.baseDir(), "full.md");
  // TODO: use stream instead...
  const fullContent = fs.readFileSync(diaryFile, "utf8");

  const section = START_TAG + "\n\n" + fullContent + "\n" + END_TAG;
  const finalResult = updateSection(
    inputFile,
    section,
    matchesStart,
    matchesEnd
  );
  // console.log("# RESULT:");
  // console.log("####################################################");
  // console.log(finalResult);
  // console.log("####################################################");
  fs.writeFileSync(file, finalResult);
  return Promise.resolve();
};
export function CreateGenerateCommand(
  pProgram: program.CommanderStatic
): Promise<program.CommanderStatic> {
  pProgram
    .command("generate [file]")
    .alias("g")
    .description(
      "Embed full diary within .md file if tags present. By default, uses Readme.md."
    )
    .action((file, _options, _command) => {
      LOGGER.debug("Entering [generate] command...");
      return embed(file);
    });
  return Promise.resolve(pProgram);
}
