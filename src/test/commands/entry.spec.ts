import { assert } from "chai";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import { entry, pad } from "../../main/commands/entry";
import { Config } from "../../main/config";
import { fileExistsSync } from "../../main/utils";
import { exec } from "child_process";
import open from "open";
import * as rimraf from "rimraf";

import { configureLogger } from "../../main/logger";

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
  let tempDir: string;
  beforeEach(function (done: () => void) {
    tempDir = fs.mkdtempSync("mkday");
    done();
  });

  afterEach(function (done: () => void) {
    rimraf.sync(tempDir);
    done();
  });

  it("entry", (done) => {
    try {
      Config.setBaseDir(tempDir);
      // console.log("Entries dir = ", Config.entriesDir());
      sinon.stub(exec);
      sinon.stub(open);

      const rightNow = new Date();
      const month = pad(rightNow.getUTCMonth() + 1); // months from 1-12
      const day = pad(rightNow.getUTCDate());
      const year = rightNow.getUTCFullYear();
      const filePath = path.join(
        Config.entriesDir(),
        String(year),
        String(month),
        `${day}.md`
      );
      assert.isFalse(fileExistsSync(filePath));

      entry().then(() => {
        try {
          assert.isTrue(fileExistsSync(filePath));
          done();
        } catch (e) {
          done(e);
        }
      });
    } catch (e) {
      done(e);
    }
  });
});
