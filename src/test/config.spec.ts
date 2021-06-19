import { assert } from "chai";
import * as utils from "../main/utils";
import { BaseConfig, Config, ConfigConstants } from "../main/config";
import { readFileSync, rmdirSync } from "fs";
import * as path from "path";

describe("config", () => {
  let config: Config;
  const baseDir = "testConfigDiary";
  const expectedConfigDir = ".testConfigDiary";
  const expectedConfigFile = path.join(expectedConfigDir, "config.json");

  beforeEach(() => {
    config = new BaseConfig(baseDir);
  });

  after(() => {
    rmdirSync(expectedConfigDir, { recursive: true });
  });

  const loadConfigFileAsJSON = (): any => {
    const configFileContent = readFileSync(expectedConfigFile, "utf8");
    const json = JSON.parse(configFileContent);
    return json;
  };

  it("config_file_exists", () => {
    const configExists = utils.fileExistsSync(".testConfigDiary/config.json");
    assert.isTrue(configExists);
  });

  it("hint", () => {
    const expected = "12345";
    config.setHint(expected);
    const json = loadConfigFileAsJSON();
    assert.equal(json[ConfigConstants.HINT], expected);
    assert.equal(config.hint(), expected);
  });

  it("includeHeader", () => {
    config.setIncludeHeader(true);
    const json = loadConfigFileAsJSON();
    assert.equal(json[ConfigConstants.INCLUDE_HEADER], true);
    assert.isTrue(config.includeHeader());
  });

  it("analyticsTag", () => {
    const expected = "UA-123";
    config.setAnalyticsTag(expected);
    const json = loadConfigFileAsJSON();
    assert.equal(json[ConfigConstants.ANALYTICS_TAG], expected);
    assert.equal(config.analyticsTag(), expected);
  });

  it("lastError", () => {
    const expected = 123456789;
    config.setLastError(expected);
    let json = loadConfigFileAsJSON();
    assert.equal(json[ConfigConstants.LAST_ERROR], expected);
    assert.equal(config.lastError(), expected);
    config.deleteLastError();
    json = loadConfigFileAsJSON();
    assert.notProperty(json, ConfigConstants.LAST_ERROR);
  });
});
