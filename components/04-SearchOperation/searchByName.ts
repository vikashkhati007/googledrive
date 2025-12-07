import { searchByNameHelper } from "../01-FileOperation/helpers";

/**
 * Search files by name
 * @param fileName - Name or partial name to search
 */
export function searchByName(fileName: string) {
  return searchByNameHelper(fileName, "file", "contains");
}
