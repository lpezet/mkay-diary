import { rmSync } from "fs";
import { BaseConfig } from "../../main/config";
import { dirExistsSync } from "../../main/utils";

const config = new BaseConfig("testWorkDir");
config.setBaseDir("." + "testWorkDir");

export const TestConfig = config;

export const deleteAllTestEntries = (): void => {
  if (dirExistsSync(TestConfig.entriesDir()))
    rmSync(TestConfig.entriesDir(), { recursive: true });
};
