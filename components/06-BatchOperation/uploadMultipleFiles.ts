import { uploadFile } from "../01-FileOperation/uploadFile";

/**
 * Upload multiple files at once
 * @param filePaths - Array of file paths to upload
 * @param folderId - Optional: Upload to specific folder
 */
export async function uploadMultipleFiles(
  filePaths: string[],
  folderId?: string
) {
  const results = [];
  for (const filePath of filePaths) {
    const result = await uploadFile(filePath, { folderId });
    results.push({ filePath, result });
  }
  return results;
}
