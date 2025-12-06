import updateNotifier from "update-notifier";
import pkg from "./package.json" assert { type: "json" };

// check update
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 12,
});

if (notifier.update) {
  console.log(`
🚀  New version available for ${pkg.name}!
${notifier.update.current} → ${notifier.update.latest}
Run: npm i -g ${pkg.name} to update.
`);
}

import * as operations from "./operations";
import { generateCredentialsAndTokens } from "./auth";
import {
  initDriveService,
  resetDriveService,
  type InitDriveServiceOptions,
} from "./drivers/services";
import {
  DriveServiceOptions,
  GoogleDriveService,
} from "./drivers/GoogleDriveService";
import { OAuth2Client, OAuth2ClientOptions } from "./drivers/oauth2-client";
export {
  generateCredentialsAndTokens,
  operations,
  initDriveService,
  resetDriveService,
  GoogleDriveService,
  OAuth2Client,
  type InitDriveServiceOptions,
  type DriveServiceOptions,
  type OAuth2ClientOptions,
};
