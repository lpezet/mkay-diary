import { assert } from "chai";
import program from "commander";
import { configureLogger } from "../../main/logger";
import { ConfigConstants } from "../../main/config";
import { ConfigCommand, Deps, Question } from "../../main/commands/config";
import { InMemoryConfig } from "../config.spec";

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

describe("command:config", function () {
  it("register", (done) => {
    const testConfig = new InMemoryConfig();
    const testDeps = {
      prompt: (_questions: Question[]): Promise<any> => {
        return Promise.resolve({});
      },
    };
    const command = new ConfigCommand(testConfig, testDeps);
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
  it("basic", function (done) {
    const expected: any = {};
    expected[ConfigConstants.EDITOR] = "test_editor";
    expected[ConfigConstants.INCLUDE_HEADER] = true;
    expected[ConfigConstants.HINT] = "a1b2c3d4f5";

    const testDeps: Deps = {
      prompt(_questions: Question[]): Promise<any> {
        _questions.forEach((q) => {
          switch (q.name) {
            case "editor":
              assert.isUndefined(q.default());
              break;
            case "hint":
              assert.isUndefined(q.default());
              break;
            case "include_header":
              assert.isUndefined(q.default());
          }
        });
        return Promise.resolve({
          editor: expected[ConfigConstants.EDITOR],
          include_header: "" + expected[ConfigConstants.INCLUDE_HEADER],
          hint: expected[ConfigConstants.HINT],
        });
      },
    };
    const testConfig = new InMemoryConfig();
    const command = new ConfigCommand(testConfig, testDeps);
    try {
      command.execute().then(() => {
        assert.equal(testConfig.editor(), expected[ConfigConstants.EDITOR]);
        assert.equal(
          testConfig.includeHeader(),
          expected[ConfigConstants.INCLUDE_HEADER]
        );
        assert.equal(testConfig.hint(), expected[ConfigConstants.HINT]);
        done();
      });
    } catch (err) {
      done(err);
    }
  });
});
