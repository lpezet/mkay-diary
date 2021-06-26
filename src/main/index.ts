import program from "commander";
import * as pkg from "../../package.json";
import { FullCommand } from "./commands/full";
import { EmbedCommand } from "./commands/embed";
import { ChildProcessInfo, EntryCommand } from "./commands/entry";

import { configureLogger } from "./logger";
import { BaseConfig, Config } from "./config";
import { Command } from "./command";
import open from "open";
import { ChildProcess, exec, ExecException } from "child_process";
import { Readable } from "stream";

configureLogger({
  appenders: {
    console: { type: "console", layout: { type: "colored" } },
  },
  categories: {
    default: { appenders: ["console"], level: "all" },
  },
});

import { createLogger } from "./logger";
const LOGGER = createLogger("main");

const readAllFromReadable = async (r: Readable | null): Promise<string> => {
  if (!r) return "";
  const chunks = [];
  for await (const chunk of r) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
};

const myOpen = (command: string): Promise<ChildProcessInfo> => {
  return open(command).then(async (cp: ChildProcess) => {
    const stdout = await readAllFromReadable(cp.stdout);
    const stderr = await readAllFromReadable(cp.stderr);
    LOGGER.debug(`open result: stdout=[${stdout}], stderr=[${stderr}]`);
    return Promise.resolve({
      stdout,
      stderr,
      killed: cp.killed,
      exitCode: cp.exitCode,
      signalCode: cp.signalCode,
    });
  });
};

const myExec = (command: string): Promise<ChildProcessInfo> => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      (error: ExecException | null, stdout: string, stderr: string) => {
        LOGGER.debug(`exec callback: stdout=[${stdout}], stderr=[${stderr}]`);
        if (error) reject(error);
        else resolve({ stderr: stderr, stdout: stdout });
      }
    );
  });
};

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
      new EntryCommand(this.config, { open: myOpen, exec: myExec }),
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
