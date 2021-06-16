import { assert } from "chai";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import { entry, pad } from "../../main/commands/entry";
import { Config } from "../../main/config";
import { fileExistsSync } from "../../main/utils";
import { exec } from "child_process";
import open from "open";
/*
import { configureLogger } from "../lib";

configureLogger({
  appenders: {
    console: { type: "console", layout: { type: "colored" } }
  },
  categories: {
    default: { appenders: ["console"], level: "all" }
  }
});
*/

/*
const inspect = (obj: any, depth: number): void => {
  console.error(util.inspect(obj, false, depth || 5, true));
};
*/

describe("command:entry", function () {
  beforeEach(function (done: () => void) {
    done();
  });

  afterEach(function (done: () => void) {
    done();
  });

  it("entry", (done) => {
    try {
      const tempDir = fs.mkdtempSync("mkday");
      Config.setBaseDir(tempDir);
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
