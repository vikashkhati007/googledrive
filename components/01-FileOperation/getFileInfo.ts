import { driveService } from "../../drivers/services";

/**
 * Get file information
 * @param fileId - Google Drive file ID
 */
export function getFileInfo(fileId: string) {
  return driveService.getFileMetadata(fileId);
}

/**
 * Get complete file metadata including all available fields
 * @param fileId - Google Drive file ID
 */
export function getCompleteFileInfo(fileId: string) {
  return driveService.getCompleteFileMetadata(fileId);
}

/**
 * Get image metadata for an image file
 * @param fileId - Google Drive file ID of the image
 */
export function getImageMetadata(fileId: string) {
  return driveService.getImageMetadata(fileId);
}

/**
 * Get video metadata for a video file
 * @param fileId - Google Drive file ID of the video
 */
export function getVideoMetadata(fileId: string) {
  return driveService.getVideoMetadata(fileId);
}
