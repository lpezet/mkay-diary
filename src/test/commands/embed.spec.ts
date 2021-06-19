import { assert } from "chai";
import * as fs from "fs";
import * as path from "path";
import { configureLogger } from "../../main/logger";
import { EmbedCommand, endTag, startTag } from "../../main/commands/embed";
import { deleteAllTestEntries, TestConfig } from "../helpers/commons";
import { Config } from "../../main/config";
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

describe("command:embed", function () {
  let config: Config;
  before(function (done: () => void) {
    config = TestConfig;
    done();
  });
  after(function (done: () => void) {
    deleteAllTestEntries();
    done();
  });
  beforeEach(function (done: () => void) {
    done();
  });

  afterEach(function (done: () => void) {
    deleteAllTestEntries();
    done();
  });

  it("register", (done) => {
    const command = new EmbedCommand(config);
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
    const command = new EmbedCommand(config);
    try {
      const filePath = path.join(config.baseDir(), "test.md");
      const hint = "123";
      const sTag = startTag(hint);
      const eTag = endTag(hint);
      const originalContent = `# This is a test.\n${sTag}\n${eTag}\n# After tags.`;
      fs.writeFileSync(filePath, originalContent);
      command.execute(filePath).then(() => {
        const actualContent = fs.readFileSync(filePath, "utf8");
        assert.notEqual(actualContent, originalContent);
        done();
      });
    } catch (e) {
      done(e);
    } finally {
      // nop
    }
  });
});
