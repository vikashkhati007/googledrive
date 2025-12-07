import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all sheet files
 */
export function listSheets() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.SPREADSHEET}' and trashed=false`,
  });
}
