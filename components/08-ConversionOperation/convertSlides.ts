import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";
import { FileMetadata } from "../../types/index";

export async function convertPptToSlides(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PRESENTATION
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert PPT → Google Slides");
}

export async function convertSlidesToPpt(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.POWERPOINT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Slides → PPTX");
}

export async function convertSlidesToPdf(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Slides → PDF");
}
