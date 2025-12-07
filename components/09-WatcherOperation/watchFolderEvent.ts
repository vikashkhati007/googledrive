import { driveService } from "../../drivers/services";
import { FileMetadata } from "../../types/index";

/**
 * Watch folder for changes
 */
export function watchFolderEvent(
  folderId: string,
  intervalMs: number = 2000,
  callback: (event: {
    type: "added" | "modified" | "deleted";
    file: FileMetadata;
  }) => void
) {
  return driveService.watchFolder(folderId, intervalMs, callback);
}
