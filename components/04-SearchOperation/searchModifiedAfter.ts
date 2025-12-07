import { driveService } from "../../drivers/services";

/**
 * Search files modified after a date
 * @param date - Date string (e.g., '2024-01-01' or '2024-01-01T10:00:00')
 */
export function searchModifiedAfter(date: string) {
  const isoDate = date.includes("T") ? date : `${date}T00:00:00`;
  return driveService.listFiles({
    query: `modifiedTime > '${isoDate}' and trashed=false`,
    orderBy: "modifiedTime desc",
  });
}
