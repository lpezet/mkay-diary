import Configstore from "configstore";
import * as path from "path";

export const ConfigConstants: { [key: string]: string } = {
  BASE_DIR: "BASE_DIR",
  EDITOR: "EDITOR",
  INCLUDE_HEADER: "INCLUDE_HEADER",
  HINT: "HINT",
  ANALYTICS_TAG: "analytics-uuid",
  LAST_ERROR: "LAST_ERROR",
};

export interface Config {
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
  deleteEditor: () => void;
}

export class BaseConfig implements Config {
  cStore: Configstore;
  constructor(id?: string) {
    id = id ? id : "diary";
    this.cStore = new Configstore(id, undefined, {
      globalConfigPath: true,
      configPath: path.join("." + id, "config.json"),
    });
    this._checkConfig();
  }
  // defaults
  _checkConfig(): void {
    let k: string;
    for (k in ConfigDefaults) {
      if (this.cStore.get(k)) continue;
      this.cStore.set(k, ConfigDefaults[k]);
    }
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

export const ConfigDefaults: { [key: string]: string } = {
  BASE_DIR: ".diary",
  EDITOR: "", // Examples: for Mac: 'open -a "/Applications/Visual Studio Code.app"', for Linux: '/usr/bin/code'
  INCLUDE_HEADER: "false",
};
