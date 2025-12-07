import { driveService } from "../../drivers/services";

/**
 * Read file content from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function readFileData(fileId: string): Promise<string> {
  const response = await driveService.readFileData(fileId);
  if (response.success && response.data) {
    return typeof response.data === "string"
      ? response.data
      : response.data.toString();
  }
  throw new Error(response.error || "Failed to read file data");
}
