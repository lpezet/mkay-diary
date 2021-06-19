import { assert } from "chai";
import * as fs from "fs";
import * as path from "path";
import { Config } from "../../main/config";
import { fileExistsSync } from "../../main/utils";
import * as joda from "@js-joda/core";

import { configureLogger } from "../../main/logger";
import { FullCommand, PRELUDE } from "../../main/commands/full";
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

  const createDiaryEntry = (
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
    const command = new FullCommand(config);
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
    const command = new FullCommand(config);
    try {
      const now = joda.LocalDate.now();
      let moment: joda.LocalDate = now.minusDays(10);
      let expected = PRELUDE + "\n\n";
      let content: string;
      for (let i = 0; i < 10; i++) {
        content = `This is entry #${i}.`;
        createDiaryEntry(
          moment.year(),
          moment.monthValue(),
          moment.dayOfMonth(),
          content
        );
        expected += content + "\n";
        // if (i > 0) expected += "\n";
        moment = moment.plusDays(1);
      }
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
});
