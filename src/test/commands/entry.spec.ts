import { assert } from "chai";
import * as path from "path";
import {
  ChildProcessInfo,
  Deps,
  EntryCommand,
  pad,
} from "../../main/commands/entry";
import { Config } from "../../main/config";
import { dirExistsSync, fileExistsSync } from "../../main/utils";

import { configureLogger } from "../../main/logger";
import { deleteAllTestEntries, TestConfig } from "../helpers/commons";
import program from "commander";
import { mkdirSync, writeFileSync } from "fs";

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

const noOpOpen = (command: string): Promise<ChildProcessInfo> => {
  return Promise.resolve({ stdout: command });
};
const noOpExec = (command: string): Promise<ChildProcessInfo> => {
  return Promise.resolve({ stdout: command });
};

const noOpDeps: Deps = {
  open: noOpOpen,
  exec: noOpExec,
};

describe("command:entry", function () {
  let config: Config;
  before((done: () => void) => {
    done();
  });
  after((done: () => void) => {
    deleteAllTestEntries();
    done();
  });
  beforeEach((done: () => void) => {
    config = TestConfig;
    done();
  });

  afterEach((done: () => void) => {
    deleteAllTestEntries();
    done();
  });
  /*
  NOT WORKING. Can't just "import * as program from "commander"", because it breaks here...fun times...
  */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  it("register", (done) => {
    const command = new EntryCommand(config, noOpDeps);
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

  it("openNew", (done) => {
    const command = new EntryCommand(config, noOpDeps);
    try {
      config.deleteEditor();
      const rightNow = new Date();
      const month = pad(rightNow.getUTCMonth() + 1); // months from 1-12
      const day = pad(rightNow.getUTCDate());
      const year = rightNow.getUTCFullYear();
      const filePath = path.join(
        config.entriesDir(),
        String(year),
        String(month),
        `${day}.md`
      );
      assert.isFalse(fileExistsSync(filePath));

      command.execute().then(() => {
        try {
          assert.isTrue(fileExistsSync(filePath));
          done();
        } catch (e) {
          done(e);
        }
      });
    } catch (e) {
      done(e);
    } finally {
      // nop
    }
  });

  it("openExisting", (done) => {
    const command = new EntryCommand(config, noOpDeps);
    try {
      config.deleteEditor();
      const rightNow = new Date();
      const month = pad(rightNow.getUTCMonth() + 1); // months from 1-12
      const day = pad(rightNow.getUTCDate());
      const year = rightNow.getUTCFullYear();
      const dirPath = path.join(
        config.entriesDir(),
        String(year),
        String(month)
      );
      const filePath = path.join(dirPath, `${day}.md`);
      if (!dirExistsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
      if (!fileExistsSync(filePath))
        writeFileSync(filePath, "Just to have somethere in there.");

      command.execute().then(() => {
        try {
          assert.isTrue(fileExistsSync(filePath));
          done();
        } catch (e) {
          done(e);
        }
      });
    } catch (e) {
      done(e);
    } finally {
      // nop
    }
  });

  it("exec", (done) => {
    const command = new EntryCommand(config, noOpDeps);
    try {
      config.setEditor("something_that_does_not_matter");
      // console.log("Entries dir = ", Config.entriesDir());

      const rightNow = new Date();
      const month = pad(rightNow.getUTCMonth() + 1); // months from 1-12
      const day = pad(rightNow.getUTCDate());
      const year = rightNow.getUTCFullYear();
      const filePath = path.join(
        config.entriesDir(),
        String(year),
        String(month),
        `${day}.md`
      );
      assert.isFalse(fileExistsSync(filePath));

      command.execute().then(() => {
        try {
          assert.isTrue(fileExistsSync(filePath));
          done();
        } catch (e) {
          done(e);
        }
      });
    } catch (e) {
      done(e);
    } finally {
      // nop
    }
  });
});
