import * as program from "commander";
// import { MKayError } from "./error";
import * as pkg from "../../package.json";
import { createLogger } from "./logger";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

import { Config } from "./config";

const LOGGER = createLogger("main");

import { configureLogger } from "./logger";
import { promiseAllSimpleSeq } from "./utils";
configureLogger({
  appenders: {
    console: { type: "console", layout: { type: "colored" } },
  },
  categories: {
    default: { appenders: ["console"], level: "all" },
  },
});

const pad = (n: number) => {
  return n < 10 ? "0" + n : n;
};
type FileInfo = {
  name: string;
  time: number;
};
const walk = (
  dir: string,
  fileFunc: (filename: string) => Promise<void>
): Promise<void> => {
  const promises: Promise<void>[] = [];
  fs.readdirSync(dir)
    .map((v: string) => {
      return {
        name: v,
        time: fs.statSync(path.join(dir, v)).mtime.getTime(),
      } as FileInfo;
    })
    .sort((a: FileInfo, b: FileInfo) => {
      return a.name.localeCompare(b.name);
    })
    .forEach(async (f: FileInfo) => {
      const fullPath = path.join(dir, f.name);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        promises.push(walk(fullPath, fileFunc));
      } else {
        promises.push(fileFunc(fullPath));
      }
    });
  return promiseAllSimpleSeq(promises);
  /*
    .map((v: FileInfo) => {
      return v.name;
    });
    */
};

const createTestCommand = (
  pProgram: program.CommanderStatic
): Promise<void> => {
  pProgram.command("test").action((_params, _options, _command) => {
    LOGGER.debug("Entering [test] command...");
    const concatFile = path.join(Config.baseDir(), "full.md");
    const wStream = fs.createWriteStream(concatFile, { start: 0 });
    return walk(Config.entriesDir(), (filename: string): Promise<void> => {
      // console.log(`Should be processing file  [${filename}]...`);
      // return Promise.resolve();
      //fs.appendFileSync(concatFile, fs.readFileSync(filename) + "\n");
      const rStream = fs.createReadStream(filename);
      rStream.pipe(wStream);
      return new Promise((resolve, reject) => {
        rStream.on("close", resolve);
        rStream.on("error", reject);
        wStream.on("error", reject);
      });
      // rStream.close();
      // wStream.write(fs.readFileSync(filename) + "\n");
    });
    wStream.close();
  });
  return Promise.resolve();
};

const createEntryCommand = (
  pProgram: program.CommanderStatic
): Promise<void> => {
  pProgram.command("entry").action((_params, _options, _command) => {
    LOGGER.debug("Entering [entry] command...");
    /*
    console.log(params);
    console.log(options);
    console.log(command);
    */
    const rightNow = new Date();
    const month = pad(rightNow.getUTCMonth() + 1); //months from 1-12
    const day = pad(rightNow.getUTCDate());
    const year = rightNow.getUTCFullYear();
    const filePath = Config.entriesDir() + `/${year}/${month}/${day}.md`;
    if (!fs.existsSync(filePath)) {
      LOGGER.debug(`Creating new file to edit: ${filePath}`);
      fs.appendFileSync(filePath, `# Entry for ${month}/${day}/${year}\n`);
    }
    const shell = Config.editor();
    if (!shell || shell === "") {
      LOGGER.debug(`Opening ${filePath}...`);
      open(filePath);
    } else {
      LOGGER.debug(`Opening ${filePath} with ${shell}...`);
      exec(shell + " " + filePath);
    }
  });
  return Promise.resolve();
};

export class Main {
  // constructor() {}
  init(): Promise<void> {
    program
      .version(pkg.version)
      .description("For manual, use man mkay")
      .option("--debug", "Set logger to DEBUG level.");
    // .option(
    //  "-l, --log-level [level]",
    //  "Specify log level: emerg (0), alert (1), crit (2), error (3), warning (4), notice (5), info (6), debug (7)"
    // );
    createEntryCommand(program);
    createTestCommand(program);
    program.command("entry").action((params, options, command) => {
      console.log("Hello world!");
      console.log(params);
      console.log(options);
      console.log(command);
      LOGGER.info("Hello from here.");
    });
    return Promise.resolve();
  }
  run(args: string[]): program.Command {
    // const opts: program.ParseOptions = new program.ParseOptions();
    console.log("# args = " + args);
    return program.parse(args);
  }
}
