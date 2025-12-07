import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all folders
 */
export function listAllFolders() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.FOLDER}' and trashed=false`,
  });
}
