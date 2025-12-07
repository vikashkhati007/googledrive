import { getIdByNameHelper } from "../01-FileOperation/helpers";

/**
 * Get folder ID by name
 * @param folderName - Folder name to find
 */
export async function getFolderIdByName(folderName: string) {
  const result = await getIdByNameHelper(folderName, "folder");

  if (result.success) {
    return {
      success: true,
      folderId: result.id || "",
      folder: result.item,
    };
  }

  return { success: false, error: result.error };
}
