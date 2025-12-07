import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all presentation files
 */
export function listPresentations() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.PRESENTATION}' and trashed=false`,
  });
}
