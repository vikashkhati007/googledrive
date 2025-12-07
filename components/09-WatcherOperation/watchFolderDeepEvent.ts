import { driveService } from "../../drivers/services";
import { FileMetadata } from "../../types/index";

/**
 * Watch folder deeply for changes (including subfolders)
 */
export function watchFolderDeepEvent(
  folderId: string,
  intervalMs: number = 2000,
  callback: (event: {
    type: "added" | "modified" | "deleted";
    file: FileMetadata;
  }) => void
) {
  return driveService.watchFolderDeep(folderId, intervalMs, callback);
}
