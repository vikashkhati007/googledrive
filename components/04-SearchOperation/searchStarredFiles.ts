import { driveService } from "../../drivers/services";

/**
 * Search starred files
 */
export function searchStarredFiles() {
  return driveService.listFiles({
    query: "starred=true and trashed=false",
  });
}
