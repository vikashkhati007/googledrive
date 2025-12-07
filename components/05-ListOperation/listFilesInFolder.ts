import { driveService } from "../../drivers/services";

/**
 * List files in a specific folder
 * @param folderId - Google Drive folder ID
 */
export function listFilesInFolder(folderId: string) {
  return driveService.listFiles({
    query: `'${folderId}' in parents and trashed=false`,
  });
}
