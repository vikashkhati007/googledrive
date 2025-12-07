import { deleteFile } from "../01-FileOperation/deleteFile";

/**
 * Delete multiple files at once
 * @param fileIds - Array of file IDs to delete
 */
export async function deleteMultipleFiles(fileIds: string[]) {
  const results = [];
  for (const fileId of fileIds) {
    const result = await deleteFile(fileId);
    results.push({ fileId, result });
  }
  return results;
}
