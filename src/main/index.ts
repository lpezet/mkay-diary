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
import { promiseAllSeq } from "./utils";
import { updateSection } from "./update-section";
configureLogger({
  appenders: {
    console: { type: "console", layout: { type: "colored" } },
  },
  categories: {
    default: { appenders: ["console"], level: "all" },
  },
});

const pad = (n: number): string => {
  return n < 10 ? "0" + String(n) : String(n);
};
type FileInfo = {
  name: string;
  time: number;
};
const walk = (
  dir: string,
  fileFunc: (filename: string) => Promise<void>
): Promise<void> => {
  const promises: (() => Promise<void>)[] = [];
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
    .forEach((f: FileInfo): void => {
      const fullPath = path.join(dir, f.name);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        promises.push(() => {
          return walk(fullPath, fileFunc);
        });
      } else {
        promises.push(() => {
          return fileFunc(fullPath);
        });
      }
    });
  return promiseAllSeq<void>(promises, undefined);
};

const createGenerateCommand = (
  pProgram: program.CommanderStatic
): Promise<program.CommanderStatic> => {
  pProgram.command("generate [file]").action((file, _options, _command) => {
    LOGGER.debug("Entering [generate] command...");
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
  });
  return Promise.resolve(pProgram);
};

const PRELUDE =
  "[//]: # (DO NOT EDIT THE FOLLOWING. This content is automatically generated from diary entries.)";

const createIndexCommand = (
  pProgram: program.CommanderStatic
): Promise<program.CommanderStatic> => {
  pProgram.command("index").action((_params, _options, _command) => {
    LOGGER.debug("Entering [index] command...");
    const concatFile = path.join(Config.baseDir(), "full.md");
    const wStream = fs.createWriteStream(concatFile, { start: 0 });
    wStream.write(PRELUDE + "\n\n");
    return walk(Config.entriesDir(), (filename: string): Promise<void> => {
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
    })
      .then(() => {
        wStream.close();
      })
      .catch((err: Error) => {
        LOGGER.error("Error (2) creating full diary.", err);
      });
  });
  return Promise.resolve(pProgram);
};

const createEntryCommand = (
  pProgram: program.CommanderStatic
): Promise<program.CommanderStatic> => {
  pProgram.command("entry").action((_params, _options, _command) => {
    LOGGER.debug("Entering [entry] command...");
    /*
    console.log(params);
    console.log(options);
    console.log(command);
    */
    const rightNow = new Date();
    const month = pad(rightNow.getUTCMonth() + 1); // months from 1-12
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
  return Promise.resolve(pProgram);
};

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
    return createEntryCommand(program)
      .then(createIndexCommand)
      .then(createGenerateCommand);
    /*
    program.command("entry").action((params, options, command) => {
      console.log("Hello world!");
      console.log(params);
      console.log(options);
      console.log(command);
      LOGGER.info("Hello from here.");
    });
    */
    // return Promise.resolve();
  }
  run(args: string[]): program.Command {
    // const opts: program.ParseOptions = new program.ParseOptions();
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    // console.log("# args = " + args);
    return program.parse(args);
  }
}
