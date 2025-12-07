// Import all operations from components
import {
  // File Operations
  readFileData,
  uploadFile,
  downloadFile,
  deleteFile,
  renameFile,
  updateFile,
  getFileInfo,
  getCompleteFileInfo,
  getImageMetadata,
  getVideoMetadata,
  moveFile,
  moveFileByName,
  copyFile,
  getFileIdByName,
  // JSON Operations
  createJsonFile,
  selectJsonContent,
  readJsonFileData,
  addJsonKeyValue,
  pushJsonObjectToArray,
  deleteJsonFieldAndKeys,
  updateJsonFieldAndValues,
  // Folder Operations
  createFolder,
  deleteFolder,
  renameFolder,
  getFolderIdByName,
  // Search Operations
  searchByName,
  searchByExactName,
  searchByType,
  searchModifiedAfter,
  searchStarredFiles,
  searchSharedFiles,
  searchByContent,
  // List Operations
  listFoldersByName,
  listAllFolders,
  listFoldersInFolder,
  listFilesInFolder,
  listFiles,
  listRecentFiles,
  listPDFs,
  listImages,
  listVideos,
  listAudios,
  listArchives,
  listJSONs,
  listSheets,
  listPresentations,
  listDocs,
  // Batch Operations
  uploadMultipleFiles,
  deleteMultipleFiles,
  downloadMultipleFiles,
  // Utility Operations
  encryptText,
  decryptText,
  filesAndFoldersToZip,
  findDuplicateFilesAndFolders,
  getFileTypeBreakdown,
  getAllFilesInParent,
  fileExists,
  getStorageQuota,
  shareFile,
  createStream,
  // Conversion Operations
  convertTextToDocs,
  convertDocsToPdf,
  convertDocsToWord,
  convertDocsToText,
  convertCsvToSheet,
  convertExcelToSheet,
  convertSheetToCsv,
  convertSheetToPdf,
  convertPptToSlides,
  convertSlidesToPpt,
  convertSlidesToPdf,
  convertPdfToDocs,
  convertDrawingToPng,
  convertDrawingToPdf,
  // Watcher Operations
  watchFolderEvent,
  watchFolderDeepEvent,
  // Script Operations
  createGoogleScript,
  updateGoogleScript,
  deleteGoogleScript,
  deployGoogleScript,
} from "./components";

// Grouped exports for easier discovery
// Usage: operations.fileOperations.readFileData()
export const fileOperations = {
  readFileData,
  uploadFile,
  downloadFile,
  deleteFile,
  renameFile,
  updateFile,
  getFileIdByName,
  getFileInfo,
  getCompleteFileInfo,
  getImageMetadata,
  getVideoMetadata,
  moveFile,
  moveFileByName,
  copyFile,
};

export const jsonOperations = {
  createJsonFile,
  readJsonFileData,
  selectJsonContent,
  addJsonKeyValue,
  pushJsonObjectToArray,
  updateJsonFieldAndValues,
  deleteJsonFieldAndKeys,
};

export const folderOperations = {
  createFolder,
  deleteFolder,
  renameFolder,
  getFolderIdByName,
};

export const searchOperations = {
  searchByName,
  searchByExactName,
  searchByType,
  searchModifiedAfter,
  searchStarredFiles,
  searchSharedFiles,
  searchByContent,
};

export const listOperations = {
  listFiles,
  listFoldersByName,
  listFilesInFolder,
  listAllFolders,
  listFoldersInFolder,
  listRecentFiles,
  listPDFs,
  listImages,
  listVideos,
  listAudios,
  listArchives,
  listJSONs,
  listSheets,
  listPresentations,
  listDocs,
};

export const batchOperations = {
  uploadMultipleFiles,
  deleteMultipleFiles,
  downloadMultipleFiles,
};

export const utilityOperations = {
  filesAndFoldersToZip,
  findDuplicateFilesAndFolders,
  getFileTypeBreakdown,
  getAllFilesInParent,
  shareFile,
  fileExists,
  getStorageQuota,
  createStream,
  encryptText,
  decryptText,
};

export const conversionOperations = {
  convertTextToDocs,
  convertDocsToPdf,
  convertDocsToWord,
  convertDocsToText,
  convertCsvToSheet,
  convertExcelToSheet,
  convertSheetToCsv,
  convertSheetToPdf,
  convertPptToSlides,
  convertSlidesToPpt,
  convertSlidesToPdf,
  convertPdfToDocs,
  convertDrawingToPng,
  convertDrawingToPdf,
};

export const watcherOperations = {
  watchFolderEvent,
  watchFolderDeepEvent,
};

export const scriptOperations = {
  createGoogleScript,
  updateGoogleScript,
  deleteGoogleScript,
  deployGoogleScript,
};

// Export all operations as a single flat object (backwards compatible)
export const driveOperations = {
  ...fileOperations,
  ...jsonOperations,
  ...folderOperations,
  ...searchOperations,
  ...listOperations,
  ...batchOperations,
  ...utilityOperations,
  ...conversionOperations,
  ...watcherOperations,
  ...scriptOperations,
};

// Also export grouped operations object for nested access
// Usage: operations.grouped.fileOperations.readFileData()
export const operations = {
  fileOperations,
  jsonOperations,
  folderOperations,
  searchOperations,
  listOperations,
  batchOperations,
  utilityOperations,
  conversionOperations,
  watcherOperations,
  scriptOperations,
};
