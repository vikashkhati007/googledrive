import { searchByNameHelper } from "../01-FileOperation/helpers";

/**
 * Search files by exact name
 * @param fileName - Exact file name
 */
export function searchByExactName(fileName: string) {
  return searchByNameHelper(fileName, "file", "exact");
}
