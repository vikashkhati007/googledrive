import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";
import { FileMetadata } from "../../types/index";

export async function convertDrawingToPng(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PNG
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Drawing → PNG");
}

export async function convertDrawingToPdf(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Drawing → PDF");
}
