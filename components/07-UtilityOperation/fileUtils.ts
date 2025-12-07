import { driveService } from "../../drivers/services";
import { searchByExactName } from "../04-SearchOperation/searchByExactName";

/**
 * Find duplicate files and folders
 */
export function findDuplicateFilesAndFolders(): Promise<void> {
  return driveService.findDuplicate();
}

/**
 * Get file type breakdown for a folder
 */
export function getFileTypeBreakdown(
  parentId: string = "root"
): Promise<Record<string, number>> {
  return driveService.getFileTypeBreakdown(parentId);
}

/**
 * Get all files in a parent folder
 */
export function getAllFilesInParent(parentId: string): Promise<any> {
  return driveService.getAllFilesInParent(parentId);
}

/**
 * Check if file exists by name
 */
export async function fileExists(fileName: string): Promise<boolean> {
  const result = await searchByExactName(fileName);
  return result.success && (result.data?.files.length || 0) > 0;
}

/**
 * Get storage quota
 */
export function getStorageQuota() {
  return driveService.getStorageQuota();
}
