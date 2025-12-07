import { driveService } from "../../drivers/services";

/**
 * Move file to a different folder
 * @param fileId - Google Drive file ID
 * @param newFolderId - Destination folder ID
 */
export async function moveFile(fileId: string, newFolderId: string) {
  return driveService.moveFile(fileId, newFolderId);
}
