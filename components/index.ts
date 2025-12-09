// Components Index - Re-export all operations from all files

// 01-FileOperation
export { readFileData } from "./01-FileOperation/readFileData";
export { uploadFile } from "./01-FileOperation/uploadFile";
export { downloadFile } from "./01-FileOperation/downloadFile";
export { deleteFile } from "./01-FileOperation/deleteFile";
export { renameFile } from "./01-FileOperation/renameFile";
export { updateFile } from "./01-FileOperation/updateFile";
export {
  getFileInfo,
  getCompleteFileInfo,
  getImageMetadata,
  getVideoMetadata,
} from "./01-FileOperation/getFileInfo";
export { moveFile } from "./01-FileOperation/moveFile";
export { copyFile } from "./01-FileOperation/copyFile";
export { getFileIdByName } from "./01-FileOperation/getFileIdByName";

// 02-JsonOperation
export { createJsonFile } from "./02-JsonOperation/createJsonFile";
export { selectJsonContent } from "./02-JsonOperation/selectJsonContent";
export { readJsonFileData } from "./02-JsonOperation/readJsonFileData";
export { addJsonKeyValue } from "./02-JsonOperation/addJsonKeyValue";
export { pushJsonObjectToArray } from "./02-JsonOperation/pushJsonObjectToArray";
export { deleteJsonFieldAndKeys } from "./02-JsonOperation/deleteJsonFieldAndKeys";
export { updateJsonFieldAndValues } from "./02-JsonOperation/updateJsonFieldAndValues";

// 03-FolderOperation
export { createFolder } from "./03-FolderOperation/createFolder";
export { deleteFolder } from "./03-FolderOperation/deleteFolder";
export { renameFolder } from "./03-FolderOperation/renameFolder";

// 04-SearchOperation
export { searchByName } from "./04-SearchOperation/searchByName";
export { searchByExactName } from "./04-SearchOperation/searchByExactName";
export { searchByType } from "./04-SearchOperation/searchByType";
export { searchModifiedAfter } from "./04-SearchOperation/searchModifiedAfter";
export { searchStarredFiles } from "./04-SearchOperation/searchStarredFiles";
export { searchSharedFiles } from "./04-SearchOperation/searchSharedFiles";
export { searchByContent } from "./04-SearchOperation/searchByContent";
export { searchFiles } from "./04-SearchOperation/searchFiles";

// 05-ListOperation
export { listFoldersByName } from "./05-ListOperation/listFoldersByName";
export { listAllFolders } from "./05-ListOperation/listAllFolders";
export { listFoldersInFolder } from "./05-ListOperation/listFoldersInFolder";
export { listFilesInFolder } from "./05-ListOperation/listFilesInFolder";
export { getFolderIdByName } from "./05-ListOperation/getFolderIdByName";
export { listFiles } from "./05-ListOperation/listFiles";
export { listRecentFiles } from "./05-ListOperation/listRecentFiles";
export { listPDFs } from "./05-ListOperation/listPDFs";
export { listImages } from "./05-ListOperation/listImages";
export { listVideos } from "./05-ListOperation/listVideos";
export { listAudios } from "./05-ListOperation/listAudios";
export { listArchives } from "./05-ListOperation/listArchives";
export { listJSONs } from "./05-ListOperation/listJSONs";
export { listSheets } from "./05-ListOperation/listSheets";
export { listPresentations } from "./05-ListOperation/listPresentations";
export { listDocs } from "./05-ListOperation/listDocs";

// 06-BatchOperation
export { uploadMultipleFiles } from "./06-BatchOperation/uploadMultipleFiles";
export { deleteMultipleFiles } from "./06-BatchOperation/deleteMultipleFiles";
export { downloadMultipleFiles } from "./06-BatchOperation/downloadMultipleFiles";

// 07-UtilityOperation
export { encryptText, decryptText } from "./07-UtilityOperation/encrypt";
export { filesAndFoldersToZip } from "./07-UtilityOperation/zip";
export {
  findDuplicateFilesAndFolders,
  getFileTypeBreakdown,
  getAllFilesInParent,
  fileExists,
  getStorageQuota,
} from "./07-UtilityOperation/fileUtils";
export { shareFile } from "./07-UtilityOperation/shareFile";
export { createStream } from "./07-UtilityOperation/createStream";

// 08-ConversionOperation
export {
  convertTextToDocs,
  convertDocsToPdf,
  convertDocsToWord,
  convertDocsToText,
} from "./08-ConversionOperation/convertDocs";
export {
  convertCsvToSheet,
  convertExcelToSheet,
  convertSheetToCsv,
  convertSheetToPdf,
} from "./08-ConversionOperation/convertSheets";
export {
  convertPptToSlides,
  convertSlidesToPpt,
  convertSlidesToPdf,
} from "./08-ConversionOperation/convertSlides";
export { convertPdfToDocs } from "./08-ConversionOperation/convertPdf";
export {
  convertDrawingToPng,
  convertDrawingToPdf,
} from "./08-ConversionOperation/convertDrawing";

// 09-WatcherOperation
export { watchFolderEvent } from "./09-WatcherOperation/watchFolderEvent";
export { watchFolderDeepEvent } from "./09-WatcherOperation/watchFolderDeepEvent";

// 10-ScriptOperation
export { createGoogleScript } from "./10-ScriptOperation/createGoogleScript";
export { updateGoogleScript } from "./10-ScriptOperation/updateGoogleScript";
export { deleteGoogleScript } from "./10-ScriptOperation/deleteGoogleScript";
export { deployGoogleScript } from "./10-ScriptOperation/deployGoogleScript";
export { runGoogleScriptFunction } from "./10-ScriptOperation/runGoogleScriptFunction";
