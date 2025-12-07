import { driveService } from "../../drivers/services";

/**
 * List all files (paginated, default 10 files)
 * @param limit - Number of files to return (default: 10)
 */
export function listFiles(limit: number = 10) {
  return driveService.listFiles({
    pageSize: limit,
    query: "trashed=false",
  });
}
