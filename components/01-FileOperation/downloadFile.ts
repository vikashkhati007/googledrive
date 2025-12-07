import { driveService } from "../../drivers/services";

/**
 * Download a file from Google Drive
 * @param fileId - Google Drive file ID
 * @param savePath - Where to save the file (e.g., './downloads/file.pdf')
 */
export function downloadFile(fileId: string, savePath: string) {
  return driveService.downloadFile(fileId, savePath);
}
