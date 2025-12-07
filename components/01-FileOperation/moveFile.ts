import { driveService } from "../../drivers/services";
import { getIdByNameHelper } from "./helpers";

/**
 * Move file to a different folder
 * @param fileId - Google Drive file ID
 * @param newFolderId - Destination folder ID
 */
export async function moveFile(fileId: string, newFolderId: string) {
  const file = await driveService.getFileMetadata(fileId);
  if (!file.success || !file.data) {
    return { success: false, error: "File not found" };
  }

  return driveService.updateFileMetadata(fileId, {
    parents: [newFolderId],
  });
}

/**
 * Move file to a different folder by name
 * @param fileName - Name of the file to move
 * @param folderName - Name of the destination folder
 */
export async function moveFileByName(fileName: string, folderName: string) {
  const [fileResult, folderResult] = await Promise.all([
    getFileIdByName(fileName),
    getFolderIdByName(folderName),
  ]);

  if (!fileResult.success || !fileResult.fileId) {
    return { success: false, error: "File not found" };
  }

  if (!folderResult.success || !folderResult.folderId) {
    return { success: false, error: "Destination folder not found" };
  }

  return moveFile(fileResult.fileId, folderResult.folderId);
}

// Internal helper for getting file ID by name
async function getFileIdByName(fileName: string) {
  const result = await getIdByNameHelper(fileName, "file");
  if (result.success) {
    return { success: true, fileId: result.id || "", file: result.item };
  }
  return { success: false, error: result.error };
}

// Internal helper for getting folder ID by name
async function getFolderIdByName(folderName: string) {
  const result = await getIdByNameHelper(folderName, "folder");
  if (result.success) {
    return { success: true, folderId: result.id || "", folder: result.item };
  }
  return { success: false, error: result.error };
}
