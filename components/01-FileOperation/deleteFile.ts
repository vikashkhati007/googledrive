import { driveService } from "../../drivers/services";

/**
 * Delete a file from Google Drive
 * @param fileId - Google Drive file ID
 */
export function deleteFile(fileId: string) {
  return driveService.deleteFile(fileId);
}
