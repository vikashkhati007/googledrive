import { driveService } from "../../drivers/services";

/**
 * Copy a file
 * @param fileId - Google Drive file ID
 * @param newName - Optional: Name for the copy
 */
export function copyFile(fileId: string, newName?: string) {
  return (driveService as any).copyFile(
    fileId,
    newName ? { name: newName } : undefined
  );
}
