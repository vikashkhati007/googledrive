import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List folders in a specific folder
 * @param folderId - Google Drive folder ID
 */
export function listFoldersInFolder(folderId: string) {
  return driveService.listFiles({
    query: `'${folderId}' in parents and mimeType='${MIME_TYPES.FOLDER}' and trashed=false`,
  });
}
