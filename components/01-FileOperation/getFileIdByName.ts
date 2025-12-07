import { getIdByNameHelper } from "./helpers";

/**
 * Get file ID by name
 * @param fileName - File name to find
 */
export async function getFileIdByName(fileName: string) {
  const result = await getIdByNameHelper(fileName, "file");

  if (result.success) {
    return {
      success: true,
      fileId: result.id || "",
      file: result.item,
    };
  }

  return { success: false, error: result.error };
}
