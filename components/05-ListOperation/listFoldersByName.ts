import { searchByNameHelper } from "../01-FileOperation/helpers";

/**
 * List folder by name
 * @param folderName - Name of the folder
 */
export function listFoldersByName(folderName: string) {
  return searchByNameHelper(folderName, "folder", "exact");
}
