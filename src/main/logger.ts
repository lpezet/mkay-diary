import {
  getLogger,
  Logger as log4jLogger,
  Level as log4jLevel,
  Configuration as log4jsConfiguration,
  configure as log4jsConfigure,
} from "log4js";

export type Logger = Omit<log4jLogger, "new">;

export type Level = log4jLevel;

export type Configuration = log4jsConfiguration;

/**
 * @param name
 * @return Logger
 */
export function createLogger(name: string): Logger {
  return getLogger(name);
}

/**
 * @param config
 */
export function configureLogger(config: Configuration): void {
  log4jsConfigure(config);
}
