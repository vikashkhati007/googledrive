import { driveService } from "../../drivers/services";

/**
 * Create a new folder
 * @param folderName - Name of the folder
 * @param parentFolderId - Optional: Parent folder ID (creates in root if not specified)
 */
export function createFolder(folderName: string, parentFolderId?: string) {
  return driveService.createFolder(folderName, parentFolderId);
}
