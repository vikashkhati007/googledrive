import { downloadFile } from "../01-FileOperation/downloadFile";

/**
 * Download multiple files at once
 * @param downloads - Array of {fileId, savePath} objects
 */
export async function downloadMultipleFiles(
  downloads: Array<{ fileId: string; savePath: string }>
) {
  const results = [];
  for (const { fileId, savePath } of downloads) {
    const result = await downloadFile(fileId, savePath);
    results.push({ fileId, savePath, result });
  }
  return results;
}
