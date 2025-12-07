import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all video files
 */
export function listVideos() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.MP4}' or mimeType='${MIME_TYPES.MKV}' or mimeType='${MIME_TYPES.WEBM}' or mimeType='${MIME_TYPES.AVI}' and trashed=false`,
  });
}
