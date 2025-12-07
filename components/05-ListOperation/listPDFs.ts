import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all PDFs
 */
export function listPDFs() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.PDF}' and trashed=false`,
  });
}
