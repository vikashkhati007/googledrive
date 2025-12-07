import { MIME_TYPES } from "../../const";
import { driveService } from "../../drivers/services";

/**
 * Generic helper to search for items by name with optional type filtering
 * @param name - Name to search for
 * @param type - Optional: 'file' | 'folder'
 * @param searchType - Optional: 'exact' | 'contains' (default: 'exact')
 */
export async function searchByNameHelper(
  name: string,
  type?: "file" | "folder",
  searchType: "exact" | "contains" = "exact"
) {
  let query =
    searchType === "exact" ? `name='${name}'` : `name contains '${name}'`;

  if (type === "folder") {
    query += ` and mimeType='${MIME_TYPES.FOLDER}'`;
  } else if (type === "file") {
    query += ` and mimeType!='${MIME_TYPES.FOLDER}'`;
  }

  query += " and trashed=false";

  return driveService.listFiles({ query });
}

/**
 * Generic helper to get ID by name with optional type filtering
 * @param name - Name to search for
 * @param type - Optional: 'file' | 'folder'
 */
export async function getIdByNameHelper(
  name: string,
  type?: "file" | "folder"
): Promise<{ success: boolean; id?: string; item?: any; error?: string }> {
  const result = await searchByNameHelper(name, type, "exact");

  if (result.success && result.data?.files.length) {
    const item = result.data.files[0];
    return {
      success: true,
      id: item.id,
      item,
    };
  }

  return {
    success: false,
    error: `${
      type ? type.charAt(0).toUpperCase() + type.slice(1) : "Item"
    } not found`,
  };
}
