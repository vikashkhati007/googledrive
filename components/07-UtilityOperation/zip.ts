import { driveService } from "../../drivers/services";

/**
 * Convert multiple files and folders to a single zip archive
 */
export function filesAndFoldersToZip(options: {
  folderId?: string;
  fileIds?: string[];
  zipName: string;
  uploadToFolderId?: string;
  password?: string;
}) {
  return driveService.convertFilesAndFoldersToZip(options);
}
