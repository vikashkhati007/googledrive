import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";
import { FileMetadata } from "../../types/index";

export async function convertTextToDocs(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.DOCUMENT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Text → Google Docs");
}

export async function convertDocsToPdf(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Docs → PDF");
}

export async function convertDocsToWord(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.WORD
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Docs → Word");
}

export async function convertDocsToText(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.TEXT
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Docs → Text");
}
