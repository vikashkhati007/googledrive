import type { GoogleCredentials, TokenData } from "../types/index";
import fs from "fs";
import { GoogleDriveService, DriveServiceOptions } from "./GoogleDriveService";

let driveService: GoogleDriveService;

export interface InitDriveServiceOptions extends DriveServiceOptions {
  /** Google credentials (will read from ./credentials.json if not provided) */
  credentials?: GoogleCredentials;
  /** Token data (will read from ./tokens.json if not provided) */
  tokens?: TokenData;
}

/**
 * Initialize the Google Drive service with automatic token refresh
 *
 * @example Basic usage (reads from files)
 * ```ts
 * const service = initDriveService();
 * ```
 *
 * @example With custom token refresh callback (for SSR/serverless)
 * ```ts
 * const service = initDriveService({
 *   credentials: myCredentials,
 *   tokens: myTokens,
 *   autoSaveToFile: false, // Disable file writes in serverless
 *   onTokensRefresh: async (tokens) => {
 *     // Save tokens to your database or session
 *     await saveTokensToDatabase(tokens);
 *   }
 * });
 * ```
 */
export function initDriveService(
  options?: InitDriveServiceOptions
): GoogleDriveService;
export function initDriveService(
  creds?: GoogleCredentials,
  tokens?: TokenData
): GoogleDriveService;
export function initDriveService(
  credsOrOptions?: GoogleCredentials | InitDriveServiceOptions,
  tokens?: TokenData
): GoogleDriveService {
  // Handle both old and new API
  let options: InitDriveServiceOptions = {};

  if (
    credsOrOptions &&
    typeof credsOrOptions === "object" &&
    "credentials" in credsOrOptions
  ) {
    // New API: options object
    options = credsOrOptions as InitDriveServiceOptions;
  } else if (
    credsOrOptions &&
    typeof credsOrOptions === "object" &&
    ("web" in credsOrOptions ||
      "installed" in credsOrOptions ||
      "client_id" in credsOrOptions)
  ) {
    // Old API: credentials, tokens
    options = { credentials: credsOrOptions as GoogleCredentials, tokens };
  }

  if (!driveService) {
    const credentials: GoogleCredentials =
      options.credentials ??
      JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));

    driveService = new GoogleDriveService(credentials, {
      tokensPath: options.tokensPath,
      autoSaveToFile: options.autoSaveToFile,
      onTokensRefresh: options.onTokensRefresh,
    });

    const tokenData: TokenData =
      options.tokens ?? JSON.parse(fs.readFileSync("./tokens.json", "utf-8"));
    driveService.setCredentials(tokenData);
  }
  return driveService;
}

/**
 * Reset the drive service instance (useful for testing or re-initialization)
 */
export function resetDriveService(): void {
  driveService = undefined as unknown as GoogleDriveService;
}

export { driveService };
