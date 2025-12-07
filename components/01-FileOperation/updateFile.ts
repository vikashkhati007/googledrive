import { driveService } from "../../drivers/services";
import { MimeType } from "../../types/index";

/**
 * Update file content (replace existing file content)
 * @param fileId - Google Drive file ID
 * @param newContent - New content for the file
 * @param mimeType - MIME type of the content
 */
export function updateFile(
  fileId: string,
  newContent: string,
  mimeType: MimeType
) {
  return driveService.updateFileContent(fileId, newContent, mimeType);
}
