import { driveService } from "../../drivers/services";

/**
 * Search files containing text
 * @param searchText - Text to search for in file content
 */
export function searchByContent(searchText: string) {
  return driveService.listFiles({
    query: `fullText contains '${searchText}' and trashed=false`,
  });
}
