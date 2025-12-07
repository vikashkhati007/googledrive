import { driveService } from "../../drivers/services";

/**
 * Delete a folder
 * @param folderId - Google Drive folder ID
 */
export function deleteFolder(folderId: string) {
  return driveService.deleteFile(folderId);
}
