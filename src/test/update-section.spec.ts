import { assert } from "chai";
import { updateSection } from "../main/update-section";
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

const update = [
  "START -- GENERATED GOODNESS",
  "this was painstakingly re-generated",
  "and we added another line",
  "here",
  "END -- GENERATED GOODNESS",
].join("\n");

const matchesStart = (line: string): boolean => {
  return /START -- GENERATED GOODNESS/.test(line);
};

const matchesEnd = (line: string): boolean => {
  return /END -- GENERATED GOODNESS/.test(line);
};

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

  it("start-and-end", function () {
    const original = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "START -- GENERATED GOODNESS",
      "this was painstakingly generated",
      "as was this",
      "END -- GENERATED GOODNESS",
      "",
      "#The End",
      "",
      "Til next time",
    ].join("\n");

    const expected = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "START -- GENERATED GOODNESS",
      "this was painstakingly re-generated",
      "and we added another line",
      "here",
      "END -- GENERATED GOODNESS",
      "",
      "#The End",
      "",
      "Til next time",
    ];

    const updated = updateSection(original, update, matchesStart, matchesEnd);

    assert.deepEqual(
      updated.split("\n"),
      expected,
      "replaces in between start and end"
    );
  });

  it("start-only", function (done) {
    const original = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "START -- GENERATED GOODNESS",
      "this was painstakingly generated",
      "as was this",
      "",
      "#The End",
      "",
      "Til next time",
    ].join("\n");

    const expected = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "START -- GENERATED GOODNESS",
      "this was painstakingly re-generated",
      "and we added another line",
      "here",
      "END -- GENERATED GOODNESS",
    ];

    const updated = updateSection(original, update, matchesStart, matchesEnd);

    assert.deepEqual(
      updated.split("\n"),
      expected,
      "replaces until end of file"
    );

    done();
  });

  it("end-only", function () {
    const original = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "this was painstakingly generated",
      "as was this",
      "",
      "END -- GENERATED GOODNESS",
      "#The End",
      "",
      "Til next time",
    ].join("\n");

    const expected = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "this was painstakingly generated",
      "as was this",
      "",
      "END -- GENERATED GOODNESS",
      "#The End",
      "",
      "Til next time",
      "",
      "START -- GENERATED GOODNESS",
      "this was painstakingly re-generated",
      "and we added another line",
      "here",
      "END -- GENERATED GOODNESS",
    ];

    const updated = updateSection(original, update, matchesStart, matchesEnd);

    assert.deepEqual(
      updated.split("\n"),
      expected,
      "adds update to end of file and keeps old section"
    );
  });

  it("no-start-or-end", function () {
    const original = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "#The End",
      "",
      "Til next time",
    ].join("\n");

    const expected = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "#The End",
      "",
      "Til next time",
      "",
      "START -- GENERATED GOODNESS",
      "this was painstakingly re-generated",
      "and we added another line",
      "here",
      "END -- GENERATED GOODNESS",
    ];

    const updated = updateSection(original, update, matchesStart, matchesEnd);

    assert.deepEqual(updated.split("\n"), expected);
  });

  it("no-start-or-end-force-top", function () {
    const original = [
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "#The End",
      "",
      "Til next time",
    ].join("\n");

    const expected = [
      "START -- GENERATED GOODNESS",
      "this was painstakingly re-generated",
      "and we added another line",
      "here",
      "END -- GENERATED GOODNESS",
      "",
      "# Some Project",
      "",
      "Does a bunch of things",
      "",
      "#The End",
      "",
      "Til next time",
    ];

    const updated = updateSection(
      original,
      update,
      matchesStart,
      matchesEnd,
      true
    );

    assert.deepEqual(updated.split("\n"), expected);
  });

  it("empty-string", function () {
    const original = "";
    const updated = updateSection(original, update, matchesStart, matchesEnd);

    assert.equal(updated, update, "returns section only");
  });
});
