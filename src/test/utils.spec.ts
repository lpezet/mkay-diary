import { assert } from "chai";
import * as utils from "../main/utils";
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

describe("update-section", function () {
  beforeEach(function (done: () => void) {
    done();
  });

  afterEach(function (done: () => void) {
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
