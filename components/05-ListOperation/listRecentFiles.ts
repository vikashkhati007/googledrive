import { driveService } from "../../drivers/services";

/**
 * List recent files (modified in last N days)
 * @param days - Number of days to look back (default: 7)
 */
export function listRecentFiles(days: number = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const isoDate = date.toISOString();

  return driveService.listFiles({
    query: `modifiedTime > '${isoDate}' and trashed=false`,
    orderBy: "modifiedTime desc",
    pageSize: 20,
  });
}
