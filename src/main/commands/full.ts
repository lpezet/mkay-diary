import * as program from "commander";
import { createLogger } from "../logger";
import * as fs from "fs";
import * as path from "path";

import { Config } from "../config";

const LOGGER = createLogger("command:index");

import { findFilesInLexicalOrder } from "../utils";
import { Command } from "../command";

export const PRELUDE =
  "[//]: # (DO NOT EDIT THE FOLLOWING. This content is automatically generated from diary entries.)";

export class FullCommand implements Command {
  config: Config;
  constructor(pConfig: Config) {
    this.config = pConfig;
  }
  register(pProg: program.CommanderStatic): Promise<program.CommanderStatic> {
    pProg
      .command("index")
      .alias("i")
      .description("Create full diary.")
      .action((_params, _options, _command) => {
        LOGGER.debug("Entering [index] command...");
        return this.execute();
      });
    return Promise.resolve(pProg);
  }
  execute(): Promise<void> {
    const concatFile = path.join(this.config.baseDir(), "full.md");
    const wStream = fs.createWriteStream(concatFile, { start: 0 });
    wStream.write(PRELUDE + "\n\n");
    return findFilesInLexicalOrder(
      this.config.entriesDir(),
      (filename: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          const rStream = fs.createReadStream(filename);
          rStream.pipe(wStream, { end: false });
          rStream.on("end", () => {
            wStream.write("\n");
          });
          rStream.on("close", () => {
            resolve();
          });
          rStream.on("error", (err: Error) => {
            LOGGER.error(
              `Error from reading [${filename}] to create full diary.`,
              err
            );
            reject();
          });
        }).catch((err: Error) => {
          LOGGER.error("Error (1) creating full diary.", err);
        });
        // rStream.close();
        // wStream.write(fs.readFileSync(filename) + "\n");
      }
    )
      .then(() => {
        wStream.close();
      })
      .catch((err: Error) => {
        LOGGER.error("Error (2) creating full diary.", err);
      });
  }
}
