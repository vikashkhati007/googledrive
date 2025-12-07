import { driveService } from "../../drivers/services";

/**
 * Search shared files
 */
export function searchSharedFiles() {
  return driveService.listFiles({
    query: "sharedWithMe=true and trashed=false",
  });
}
