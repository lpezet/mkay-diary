import { CommanderStatic } from "commander";
// import { MKayError } from "./error";
import * as fs from "fs";
import * as path from "path";
import { createLogger } from "../logger";
import { Config } from "../config";
import { Command } from "../command";

const LOGGER = createLogger("command:entry");

export const pad = (n: number): string => {
  return n < 10 ? "0" + String(n) : String(n);
};

export type ChildProcessInfo = {
  readonly stdout?: string;
  readonly stderr?: string;
  readonly killed?: boolean;
  readonly pid?: number;
  readonly exitCode?: number | null;
  readonly signalCode?: NodeJS.Signals | null;
};
export type Deps = {
  open: (command: string) => Promise<ChildProcessInfo>;
  exec: (command: string) => Promise<ChildProcessInfo>;
};

export class EntryCommand implements Command {
  config: Config;
  deps: Deps;
  constructor(pConfig: Config, pDeps: Deps) {
    this.config = pConfig;
    this.deps = pDeps;
  }
  name(): string {
    return "entry";
  }
  register(pProg: CommanderStatic): Promise<CommanderStatic> {
    pProg
      .command("entry")
      .alias("e")
      .description("Create or edit today's entry.")
      .action((_params, _options, _command) => {
        LOGGER.debug("Entering [entry] command...");
        return this.execute();
      });
    return Promise.resolve(pProg);
  }
  execute(): Promise<void> {
    try {
      const rightNow = new Date();
      const month = pad(rightNow.getUTCMonth() + 1); // months from 1-12
      const day = pad(rightNow.getUTCDate());
      const year = rightNow.getUTCFullYear();
      const dirPath = path.join(
        this.config.entriesDir(),
        String(year),
        String(month)
      );
      const filePath = path.join(dirPath, `${day}.md`);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      if (!fs.existsSync(filePath)) {
        LOGGER.debug(`Creating new file to edit: ${filePath}`);
        fs.appendFileSync(filePath, `## Entry for ${month}/${day}/${year}\n`);
      }
      const shell = this.config.editor();
      if (!shell || shell === "") {
        LOGGER.debug(`Opening ${filePath}...`);
        return this.deps.open(filePath).then(() => Promise.resolve());
      } else {
        LOGGER.debug(`Opening ${filePath} with ${shell}...`);
        return this.deps
          .exec(shell + " " + filePath)
          .then(() => Promise.resolve());
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
