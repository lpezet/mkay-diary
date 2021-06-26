import { assert } from "chai";
import * as fs from "fs";
import * as path from "path";
import { Config } from "../../main/config";
import { fileExistsSync } from "../../main/utils";
import * as joda from "@js-joda/core";

import { configureLogger } from "../../main/logger";
import { Deps, FullCommand, PRELUDE } from "../../main/commands/full";
import { deleteAllTestEntries, TestConfig } from "../helpers/commons";
import { pad } from "../../main/commands/entry";
import program from "commander";

configureLogger({
  appenders: {
    console: { type: "console", layout: { type: "colored" } },
  },
  categories: {
    default: { appenders: ["console"], level: "all" },
  },
});

/*
const inspect = (obj: any, depth: number): void => {
  console.error(util.inspect(obj, false, depth || 5, true));
};
*/

class StreamError extends fs.ReadStream {
  constructor(opts: any) {
    super(opts);
  }
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    if (event === "error") {
      setTimeout(() => {
        this.emit("error", new Error("Error for testing purposes"));
      }, 0);
    }
    return super.on(event, listener);
  }
}

const standardDeps: Deps = {
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream,
};

const errorReadDeps: Deps = {
  createWriteStream: fs.createWriteStream,
  createReadStream: (path: fs.PathLike) => new StreamError(path),
};

describe("command:full", function () {
  let config: Config;
  before(function (done: () => void) {
    deleteAllTestEntries();
    done();
  });
  after(function (done: () => void) {
    deleteAllTestEntries();
    done();
  });
  beforeEach(function (done: () => void) {
    config = TestConfig;
    done();
  });

  afterEach(function (done: () => void) {
    deleteAllTestEntries();
    done();
  });

  const createTestEntries = (): string => {
    let fullContent = "";
    const now = joda.LocalDate.now();
    let moment: joda.LocalDate = now.minusDays(10);
    let content: string;
    for (let i = 0; i < 10; i++) {
      content = `This is entry #${i}.`;
      createTestDiaryEntry(
        moment.year(),
        moment.monthValue(),
        moment.dayOfMonth(),
        content
      );
      fullContent += content + "\n";
      // if (i > 0) expected += "\n";
      moment = moment.plusDays(1);
    }
    return fullContent;
  };

  const createTestDiaryEntry = (
    pYear: number,
    pMonth: number,
    pDay: number,
    pContent: string
  ): void => {
    const paddedDay = pad(pDay);
    const dirPath = path.join(config.entriesDir(), String(pYear), pad(pMonth));
    const filePath = path.join(dirPath, `${paddedDay}.md`);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.appendFileSync(filePath, pContent);
    }
  };

  it("register", (done) => {
    const command = new FullCommand(config, standardDeps);
    command
      .register(program)
      .then(() => {
        let hasCommand = false;
        program.commands.forEach((c) => {
          if (c.name() === command.name()) hasCommand = true;
        });
        hasCommand
          ? done()
          : done(new Error("Command failed to register or missing."));
      })
      .catch(done);
  });

  it("basic", (done) => {
    const command = new FullCommand(config, standardDeps);
    try {
      const fullContent = createTestEntries();
      const expected = PRELUDE + "\n\n" + fullContent;
      command
        .execute()
        .then(() => {
          const filePath = path.join(config.baseDir(), "full.md");
          assert.isTrue(fileExistsSync(filePath));
          const actualContent = fs.readFileSync(filePath, "utf8");
          assert.equal(actualContent, expected);
          done();
        })
        .catch((err: Error) => {
          done(err);
        });
    } catch (e) {
      done(e);
    } finally {
      // nop
    }
  });

  it("error", (done) => {
    const command = new FullCommand(config, errorReadDeps);
    createTestEntries(); // just so that utils.findFilesInLexicalOrder() works
    command
      .execute()
      .then(() => {
        done(new Error("Expected error."));
      })
      .catch(() => {
        done();
      });
  });
});
