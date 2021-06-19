import { assert } from "chai";
import * as path from "path";
import * as sinon from "sinon";
import { EntryCommand, pad } from "../../main/commands/entry";
import { Config } from "../../main/config";
import { fileExistsSync } from "../../main/utils";
import { exec } from "child_process";
import open from "open";

import { configureLogger } from "../../main/logger";
import { deleteAllTestEntries, TestConfig } from "../helpers/commons";

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

describe("command:entry", function () {
  let config: Config;
  before(function (done: () => void) {
    sinon.stub(exec);
    sinon.stub(open);
    done();
  });
  after(function (done: () => void) {
    sinon.reset();
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
  /*
  NOT WORKING. Can't just "import * as program from "commander"", because it breaks here...fun times...
  it("create", (done) => {
    CreateEntryCommand(program) // not really good
      .then(done)
      .catch((err: Error) => {
        done(err);
      });
  });
  */
  it("open", (done) => {
    const command = new EntryCommand(config);
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

  it("exec", (done) => {
    const command = new EntryCommand(config);
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
