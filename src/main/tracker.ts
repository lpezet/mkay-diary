import ua, { Visitor } from "universal-analytics";

import * as _ from "lodash";
import { Config } from "./config";
import * as pkg from "../../package.json";
import * as uuid from "uuid";
import { createLogger } from "./logger";
const logger = createLogger("tracker");

export class Tracker {
  config: Config;
  visitor: Visitor;
  constructor(config: Config) {
    this.config = config;
    let anonId = this.config.analyticsTag();
    if (!anonId) {
      anonId = uuid.v4();
      this.config.setAnalyticsTag(anonId);
    }
    this.visitor = ua(
      process.env.FIREBASE_ANALYTICS_UA || "G-WRFZKCVGMK",
      anonId,
      {
        strictCidFormat: false,
        https: true,
      }
    );
    this.visitor.set("cd1", process.platform); // Platform
    this.visitor.set("cd2", process.version); // NodeVersion
    this.visitor.set("cd3", process.env.FIREPIT_VERSION || "none"); // FirepitVersion
  }
  /**
   * @param action Action
   * @param label Label
   * @param duration Duration
   * @return Promise<void>
   */
  track(action: string, label: string, duration = 0): Promise<void> {
    return new Promise((resolve) => {
      if (!_.isString(action) || !_.isString(label)) {
        logger.debug("track received non-string arguments:", action, label);
        resolve();
      }
      duration = duration || 0;
      if (this.config.get("tokens") && this.config.get("usage")) {
        this.visitor
          .event("MKay CLI " + pkg.version, action, label, duration)
          .send(function () {
            // we could handle errors here, but we won't
            resolve();
          });
      } else {
        resolve();
      }
    });
  }
}
