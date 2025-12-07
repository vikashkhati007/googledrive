import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * List all audio files
 */
export function listAudios() {
  return driveService.listFiles({
    query: `mimeType='${MIME_TYPES.MP3}' or mimeType='${MIME_TYPES.WAV}' and trashed=false`,
  });
}
