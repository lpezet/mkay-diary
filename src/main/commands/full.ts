import * as program from "commander";
import { createLogger } from "../logger";
import * as fs from "fs";
import * as path from "path";

import { Config } from "../config";

const LOGGER = createLogger("command:full");

import { findFilesInLexicalOrder } from "../utils";
import { Command } from "../command";

export type Deps = {
  createWriteStream: typeof fs.createWriteStream;
  createReadStream: typeof fs.createReadStream;
};

export const PRELUDE =
  "[//]: # (DO NOT EDIT THE FOLLOWING. This content is automatically generated from diary entries.)";

export class FullCommand implements Command {
  config: Config;
  deps: Deps;
  constructor(pConfig: Config, pDeps: Deps) {
    this.config = pConfig;
    this.deps = pDeps;
  }
  name(): string {
    return "full";
  }
  register(pProg: program.CommanderStatic): Promise<program.CommanderStatic> {
    pProg
      .command("full")
      .alias("f")
      .description("Create full diary.")
      .action((_params, _options, _command) => {
        LOGGER.debug("Entering [full] command...");
        return this.execute();
      });
    return Promise.resolve(pProg);
  }
  execute(): Promise<void> {
    const concatFile = path.join(this.config.baseDir(), "full.md");
    const wStream = this.deps.createWriteStream(concatFile, { start: 0 });
    wStream.write(PRELUDE + "\n\n");
    const oFilesProcessed = findFilesInLexicalOrder(
      this.config.entriesDir(),
      (filename: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          const rStream = this.deps.createReadStream(filename);
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
            reject(err);
          });
        });
        // rStream.close();
        // wStream.write(fs.readFileSync(filename) + "\n");
      }
    );

    return oFilesProcessed.finally(() => {
      wStream.close();
    });
    /*
      .catch((err: Error) => {
        LOGGER.error("Error (2) creating full diary.", err);
        throw err;
      });
      */
  }
}
