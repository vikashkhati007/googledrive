import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * Search by file type
 * @param type - 'pdf', 'image', 'document', 'spreadsheet', 'folder', or custom mime type
 */
export function searchByType(type: string) {
  const mimeTypes: Record<string, string> = {
    pdf: MIME_TYPES.PDF,
    image: "image/",
    document: MIME_TYPES.DOCUMENT,
    spreadsheet: MIME_TYPES.SPREADSHEET,
    presentation: MIME_TYPES.PRESENTATION,
    folder: MIME_TYPES.FOLDER,
  };

  const mimeType = mimeTypes[type.toLowerCase()] || type;
  const query = mimeType.endsWith("/")
    ? `mimeType contains '${mimeType}' and trashed=false`
    : `mimeType='${mimeType}' and trashed=false`;

  return driveService.listFiles({ query });
}
