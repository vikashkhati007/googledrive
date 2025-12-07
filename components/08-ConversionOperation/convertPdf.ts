import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";
import { FileMetadata } from "../../types/index";

export async function convertPdfToDocs(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.DOCUMENT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert PDF → Google Docs");
}
