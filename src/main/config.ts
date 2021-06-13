import * as Configstore from "configstore";
// import logger from "./logger";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json");
const cStore = new Configstore(pkg.name);

const ConfigConstants: { [key: string]: string } = {
  BASE_DIR: "BASE_DIR",
  EDITOR: "EDITOR",
  INCLUDE_HEADER: "INCLUDE_HEADER",
  HINT: "HINT",
  ANALYTICS_TAG: "analytics-uuid",
  LAST_ERROR: "LAST_ERROR",
};

interface Config {
  baseDir: () => string;
  entriesDir: () => string;
  editor: () => string;
  includeHeader: () => boolean;
  hint: () => string;
  analyticsTag: () => string;
  lastError: () => number;

  get: (key: string) => any;
  set: (key: string, val: any) => void;
  delete: (key: string) => void;

  setBaseDir: (val: string) => void;
  setEditor: (val: string) => void;
  setIncludeHeader: (val: boolean) => void;
  setHint: (val: string) => void;
  setAnalyticsTag: (val: string) => void;
  setLastError: (val: number) => void;

  deleteLastError: () => void;
}

class BaseConfig implements Config {
  baseDir(): string {
    return cStore.get(ConfigConstants.BASE_DIR) as string;
  }
  entriesDir(): string {
    return this.baseDir() + "/entries";
  }
  editor(): string {
    return cStore.get(ConfigConstants.EDITOR) as string;
  }
  includeHeader(): boolean {
    return cStore.get(ConfigConstants.INCLUDE_HEADER) as boolean;
  }
  hint(): string {
    return cStore.get(ConfigConstants.HINT) as string;
  }
  analyticsTag(): string {
    return cStore.get(ConfigConstants.ANALYTICS_TAG) as string;
  }
  lastError(): number {
    return cStore.get(ConfigConstants.LAST_ERROR) as number;
  }

  get(key: string): any {
    return cStore.get(key);
  }
  set(key: string, val: any): void {
    return cStore.set(key, val);
  }
  delete(key: string): void {
    cStore.delete(key);
  }

  setBaseDir(val: string): void {
    cStore.set(ConfigConstants.BASE_DIR, val);
  }
  setEditor(val: string): void {
    cStore.set(ConfigConstants.EDITOR, val);
  }
  setIncludeHeader(val: boolean): void {
    cStore.set(ConfigConstants.INCLUDE_HEADER, "" + val);
  }
  setHint(val: string): void {
    cStore.set(ConfigConstants.HINT, val);
  }
  setAnalyticsTag(val: string): void {
    cStore.set(ConfigConstants.ANALYTICS_TAG, val);
  }
  setLastError(val: number): void {
    cStore.set(ConfigConstants.LAST_ERROR, val);
  }

  deleteLastError(): void {
    cStore.delete(ConfigConstants.LAST_ERROR);
  }
}

const ConfigDefaults: { [key: string]: string } = {
  BASE_DIR: ".diary",
  EDITOR: 'open -a "/Applications/Visual Studio Code.app"',
  INCLUDE_HEADER: "false",
};

// defaults
const checkConfig = () => {
  let k: string;
  for (k in ConfigDefaults) {
    if (cStore.get(k)) continue;
    cStore.set(k, ConfigDefaults[k]);
  }
};

checkConfig();

export const Config = new BaseConfig();
