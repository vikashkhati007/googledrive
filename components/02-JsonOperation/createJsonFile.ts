import { driveService } from "../../drivers/services";

/**
 * Create a new JSON file on Google Drive.
 * @param jsonContent - JSON object to store in the file.
 * @param name - Name for the new JSON file.
 */
export function createJsonFile(jsonContent: any, name: string) {
  return driveService.createJsonFile(JSON.stringify(jsonContent), name);
}
