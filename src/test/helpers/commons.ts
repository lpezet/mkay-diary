import { rmSync } from "fs";
import { BaseConfig } from "../../main/config";
import { dirExistsSync, fileExistsSync } from "../../main/utils";
import * as path from "path";

const config = new BaseConfig("testWorkDir");
config.setBaseDir("." + "testWorkDir");

export const TestConfig = config;

export const deleteAllTestEntries = (): void => {
  if (dirExistsSync(TestConfig.entriesDir()))
    rmSync(TestConfig.entriesDir(), { recursive: true });
  const fullFilePath = path.join(TestConfig.baseDir(), "full.md");
  if (fileExistsSync(fullFilePath)) rmSync(fullFilePath);
};
