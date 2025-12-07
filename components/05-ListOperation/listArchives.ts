import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all archive files
 */
export function listArchives() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.ZIP}' or mimeType='${MIME_TYPES.RAR}' and trashed=false`,
  });
}
