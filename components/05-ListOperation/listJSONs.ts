import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all json files
 */
export function listJSONs() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.JSON}' and trashed=false`,
  });
}
