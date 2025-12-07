import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all images
 */
export function listImages() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.JPEG}' or mimeType='${MIME_TYPES.PNG}' or mimeType='${MIME_TYPES.GIF}' or mimeType='${MIME_TYPES.SVG}' and trashed=false`,
  });
}
