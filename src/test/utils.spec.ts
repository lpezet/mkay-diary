import { assert } from "chai";
import * as utils from "../main/utils";
import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
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

describe("utils", function () {
  let tempDir: string;
  beforeEach(function (done: () => void) {
    tempDir = fs.mkdtempSync("mkday");
    done();
  });

  afterEach(function (done: () => void) {
    rimraf.sync(tempDir);
    done();
  });

  const newSeqPromise = (
    letter: string,
    results: string[],
    waitTime: number
  ): (() => Promise<void>) => {
    return () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          results.push(letter);
          resolve();
        }, waitTime);
      });
    };
  };

  it("getInheritedOption", () => {
    const expected = "Good";
    const opts = {
      parent: {
        parent: {
          toto: expected,
        },
      },
    };
    const actual = utils.getInheritedOption(opts, "toto");
    assert.equal(actual, expected);
  });

  it("fileExistsSync", () => {
    const tempFile1 = path.join(tempDir, "utils.test.tmp");
    fs.writeFileSync(tempFile1, "Hey there!");
    assert.isTrue(utils.fileExistsSync(tempFile1));
  });

  it("dirExistsSync", () => {
    const tempPath1 = path.join(tempDir, "test", "more");
    fs.mkdirSync(tempPath1, { recursive: true });
    assert.isTrue(utils.dirExistsSync(tempPath1));
  });

  it("stringToStream", () => {
    const expected = "hello world";
    const actual = utils.stringToStream(expected);
    assert.isNotNull(actual);
    const read = actual?.read();
    assert.isNotNull(read);
    assert.equal(read.toString(), expected);
  });

  it("envOverride", () => {
    const varName = "temp123";
    let expected = "Hello";
    process.env[varName] = expected;
    let actual = utils.envOverride(varName, "World");
    assert.equal(
      actual,
      expected,
      "should return env var value, not passed value."
    );
    expected = "Somethingelse";
    actual = utils.envOverride(varName, expected, () => {
      throw new Error("Error for test purposes.");
    });
    assert.equal(
      actual,
      expected,
      "should return passed value as coerce threw error."
    );

    expected = "World!";
    actual = utils.envOverride(varName, expected, (_v: string, dv: string) => {
      return dv;
    });
    assert.equal(actual, expected);

    actual = utils.envOverride(
      "something_that-clearly--does-not-exits",
      expected
    );
    assert.equal(
      actual,
      expected,
      "should use passed value since no env var of this name."
    );
  });

  it("findFilesInLexicalOrder", (done) => {
    // # File 1
    const tempPath1 = path.join(tempDir, "2021", "02", "09");
    fs.mkdirSync(tempPath1, { recursive: true });
    const tempFile1 = path.join(tempPath1, "19.md");
    fs.writeFileSync(tempFile1, "Hey there!");
    // File 2
    const tempPath2 = path.join(tempDir, "2021", "02", "11");
    fs.mkdirSync(tempPath2, { recursive: true });
    const tempFile2 = path.join(tempPath2, "23.md");
    fs.writeFileSync(tempFile2, "Bye there!");
    // File 2b
    const tempPath2b = path.join(tempDir, "2021", "02", "11");
    fs.mkdirSync(tempPath2b, { recursive: true });
    const tempFile2b = path.join(tempPath2, "11.md");
    fs.writeFileSync(tempFile2b, "World!");
    // File 3
    const tempPath3 = path.join(tempDir, "2021", "03", "01");
    fs.mkdirSync(tempPath3, { recursive: true });
    const tempFile3 = path.join(tempPath3, "01.md");
    fs.writeFileSync(tempFile3, "Bye bye now!");

    const filesFoundInOrder: string[] = [];
    utils
      .findFilesInLexicalOrder(tempDir, (filename: string): Promise<void> => {
        filesFoundInOrder.push(filename);
        return Promise.resolve();
      })
      .then(() => {
        try {
          assert.deepEqual(filesFoundInOrder, [
            tempFile1,
            tempFile2b,
            tempFile2,
            tempFile3,
          ]);
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  it("seq", function (done) {
    const sequence: string[] = [];
    const promises: (() => Promise<void>)[] = [];
    promises.push(newSeqPromise("A", sequence, Math.random() * 100));
    promises.push(newSeqPromise("B", sequence, Math.random() * 50));
    promises.push(newSeqPromise("C", sequence, Math.random() * 10));
    utils.promiseAllSeq(promises, undefined).then(() => {
      try {
        assert.deepEqual(sequence, ["A", "B", "C"]);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
