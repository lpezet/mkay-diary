import * as program from "commander";
// import { MKayError } from "./error";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

import { createLogger } from "../logger";
import { Config } from "../config";
import open from "open";

const LOGGER = createLogger("command:entry");

export const pad = (n: number): string => {
  return n < 10 ? "0" + String(n) : String(n);
};

export const entry = (): Promise<void> => {
  try {
    const rightNow = new Date();
    const month = pad(rightNow.getUTCMonth() + 1); // months from 1-12
    const day = pad(rightNow.getUTCDate());
    const year = rightNow.getUTCFullYear();
    const dirPath = path.join(Config.entriesDir(), String(year), String(month));
    const filePath = path.join(dirPath, `${day}.md`);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    if (!fs.existsSync(filePath)) {
      LOGGER.debug(`Creating new file to edit: ${filePath}`);
      fs.appendFileSync(filePath, `## Entry for ${month}/${day}/${year}\n`);
    }
    const shell = Config.editor();
    if (!shell || shell === "") {
      LOGGER.debug(`Opening ${filePath}...`);
      open(filePath);
    } else {
      LOGGER.debug(`Opening ${filePath} with ${shell}...`);
      exec(shell + " " + filePath);
    }
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

export function CreateEntryCommand(
  pProgram: program.CommanderStatic
): Promise<program.CommanderStatic> {
  pProgram
    .command("entry")
    .alias("e")
    .description("Create or edit today's entry.")
    .action((_params, _options, _command) => {
      LOGGER.debug("Entering [entry] command...");
      return entry();
    });
  return Promise.resolve(pProgram);
}
