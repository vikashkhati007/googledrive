import { driveService } from "../../drivers/services";
import { MimeType } from "../../types/index";

/**
 * Upload a file to Google Drive
 * @param filePath - Path to local file (e.g., './document.pdf')
 * @param options - Optional: fileName, folderId
 */
export function uploadFile(
  filePath: string,
  options?: {
    fileName?: string;
    folderId?: string;
    description?: string;
    mimeType?: MimeType;
  }
) {
  return driveService.uploadFile(filePath, {
    name: options?.fileName,
    parents: options?.folderId ? [options.folderId] : undefined,
    description: options?.description,
    mimeType: options?.mimeType,
  });
}
