import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all docs files
 */
export function listDocs() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.DOCUMENT}' and trashed=false`,
  });
}
