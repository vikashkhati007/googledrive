import { driveService } from "../../drivers/services";

/**
 * Rename a file
 * @param fileId - Google Drive file ID
 * @param newName - New name for the file
 */
export function renameFile(fileId: string, newName: string) {
  return driveService.updateFileMetadata(fileId, { name: newName });
}
