import { assert } from "chai";
import * as utils from "../main/utils";
import { BaseConfig, Config, ConfigConstants } from "../main/config";
import { readFileSync, rmSync } from "fs";
import * as path from "path";

class InMemoryStore {
  store: any;
  constructor() {
    this.store = {};
  }
  set(key: string, value: any): void {
    this.store[key] = value;
  }
  get(key: string): any {
    return this.store[key];
  }
  delete(key: string): void {
    delete this.store[key];
  }
}

export class InMemoryConfig implements Config {
  cStore: InMemoryStore;
  constructor(id?: string) {
    id = id ? id : "diary";
    this.cStore = new InMemoryStore();
  }
  baseDir(): string {
    return this.cStore.get(ConfigConstants.BASE_DIR) as string;
  }
  entriesDir(): string {
    return this.baseDir() + "/entries";
  }
  editor(): string {
    return this.cStore.get(ConfigConstants.EDITOR) as string;
  }
  includeHeader(): boolean {
    return this.cStore.get(ConfigConstants.INCLUDE_HEADER) as boolean;
  }
  hint(): string {
    return this.cStore.get(ConfigConstants.HINT) as string;
  }
  analyticsTag(): string {
    return this.cStore.get(ConfigConstants.ANALYTICS_TAG) as string;
  }
  lastError(): number {
    return this.cStore.get(ConfigConstants.LAST_ERROR) as number;
  }

  get(key: string): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.cStore.get(key);
  }
  set(key: string, val: any): void {
    return this.cStore.set(key, val);
  }
  delete(key: string): void {
    this.cStore.delete(key);
  }

  setBaseDir(val: string): void {
    this.cStore.set(ConfigConstants.BASE_DIR, val);
  }
  setEditor(val: string): void {
    this.cStore.set(ConfigConstants.EDITOR, val);
  }
  setIncludeHeader(val: boolean): void {
    this.cStore.set(ConfigConstants.INCLUDE_HEADER, val);
  }
  setHint(val: string): void {
    this.cStore.set(ConfigConstants.HINT, val);
  }
  setAnalyticsTag(val: string): void {
    this.cStore.set(ConfigConstants.ANALYTICS_TAG, val);
  }
  setLastError(val: number): void {
    this.cStore.set(ConfigConstants.LAST_ERROR, val);
  }

  deleteLastError(): void {
    this.cStore.delete(ConfigConstants.LAST_ERROR);
  }
  deleteEditor(): void {
    this.cStore.delete(ConfigConstants.EDITOR);
  }
}

describe("config", () => {
  let config: Config;
  const baseDir = "testConfigDiary";
  const expectedConfigDir = ".testConfigDiary";
  const expectedConfigFile = path.join(expectedConfigDir, "config.json");

  beforeEach(() => {
    config = new BaseConfig(baseDir);
  });

  after(() => {
    rmSync(expectedConfigDir, { recursive: true });
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

  it("getSetDelete", () => {
    const expected = 123456789;
    config.set("test", expected);
    let json = loadConfigFileAsJSON();
    assert.property(json, "test");
    const actual = config.get("test");
    assert.equal(actual, expected);
    config.delete("test");
    json = loadConfigFileAsJSON();
    assert.notProperty(json, "test");
  });
});
