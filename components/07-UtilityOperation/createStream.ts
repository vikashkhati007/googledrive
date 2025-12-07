import { driveService } from "../../drivers/services";

/**
 * Create stream for any Google Drive file (audio, video, image, doc, etc.)
 */
export function createStream(fileId: string, targetMimeType: string) {
  return driveService.createStream(fileId, targetMimeType);
}
