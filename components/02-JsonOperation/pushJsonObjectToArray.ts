import { driveService } from "../../drivers/services";

/**
 * Add a JSON object to a specified array path in a JSON file stored on Google Drive.
 * Supports nested array paths (e.g., "user.items.0").
 */
export function pushJsonObjectToArray(
  fileId: string,
  arrayPath: string,
  newObject: any
) {
  return driveService.pushJsonObjectToArray(fileId, arrayPath, newObject);
}
