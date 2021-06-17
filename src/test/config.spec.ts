import { assert } from "chai";
import * as utils from "../main/utils";
import { BaseConfig, Config } from "../main/config";
import { readFileSync } from "fs";
import * as path from "path";

describe("config", () => {
  let config: Config;
  const baseDir = "testDiary";
  const expectedConfigDir = ".testDiary";
  const expectedConfigFile = path.join(expectedConfigDir, "config.json");

  beforeEach(() => {
    config = new BaseConfig(baseDir);
  });

  after(() => {
    // unlinkSync(baseDir);
  });

  const loadConfigFileAsJSON = (): any => {
    const configFileContent = readFileSync(expectedConfigFile, "utf8");
    const json = JSON.parse(configFileContent);
    return json;
  };

  it("config_file_exists", () => {
    const configExists = utils.fileExistsSync(".testDiary/config.json");
    assert.isTrue(configExists);
  });

  it("hint", () => {
    const expected = "12345";
    config.setHint(expected);
    const json = loadConfigFileAsJSON();
    assert.equal(json["HINT"], expected);
  });
});
