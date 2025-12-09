import { driveService } from "../../drivers/services";

/**
 * Search files by raw query string
 * @param query - Google Drive API query string (e.g. "name = 'test' and trashed = false")
 * @param pageSize - Max results, default 10
 */
export function searchFiles(query: string, pageSize: number = 10) {
  return driveService.searchFiles(query, pageSize);
}
