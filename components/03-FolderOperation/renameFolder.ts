import { driveService } from "../../drivers/services";

/**
 * Rename a folder
 * @param folderId - Google Drive folder ID
 * @param newName - New name for the folder
 */
export function renameFolder(folderId: string, newName: string) {
  return driveService.updateFileMetadata(folderId, { name: newName });
}
