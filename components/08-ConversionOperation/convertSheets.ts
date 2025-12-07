import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";
import { FileMetadata } from "../../types/index";

export async function convertCsvToSheet(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.SPREADSHEET
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert CSV → Google Sheet");
}

export async function convertExcelToSheet(
  fileId: string
): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.SPREADSHEET
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Excel → Google Sheet");
}

export async function convertSheetToCsv(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.CSV
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Sheet → CSV");
}

export async function convertSheetToPdf(fileId: string): Promise<FileMetadata> {
  const response = await driveService.ConversionFunction(
    fileId,
    MIME_TYPES.PDF
  );
  if (response.success && response.data) return response.data;
  throw new Error(response.error || "Failed to convert Sheet → PDF");
}
