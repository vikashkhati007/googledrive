import {
  GoogleCredentials,
  TokenData,
  ListFilesParams,
  UploadFileMetadata,
  ApiResponse,
  FileMetadata,
  ListFilesResponse,
  ImageMediaMetadata,
  VideoMediaMetadata,
  StorageQuota,
} from "../types/index";
import { OAuth2Client } from "./oauth2-client";
import { Readable } from "stream";

export interface DriveServiceOptions {
  /** Path to tokens file (default: ./tokens.json) */
  tokensPath?: string;
  /** Whether to auto-save tokens to file (default: true) */
  autoSaveToFile?: boolean;
  /** Callback when tokens are refreshed - use this for custom persistence in SSR/serverless */
  onTokensRefresh?: (tokens: TokenData) => void;
}

export class GoogleDriveService {
  private oauth2: OAuth2Client;

  constructor(credentials: GoogleCredentials, options?: DriveServiceOptions) {
    this.oauth2 = new OAuth2Client(credentials, {
      tokensPath: options?.tokensPath,
      autoSaveToFile: options?.autoSaveToFile,
      onTokensRefresh: options?.onTokensRefresh,
    });
  }

  /**
   * Set credentials and enable auto-refresh
   */
  public setCredentials(tokens: TokenData): void {
    this.oauth2.setCredentials(tokens);
  }

  /**
   * Set callback for when tokens are refreshed
   * This is the recommended way to persist tokens in SSR/serverless environments
   */
  public onTokensRefreshed(callback: (tokens: TokenData) => void): void {
    this.oauth2.onTokensRefreshed(callback);
  }

  /**
   * Check if the current token is expired or about to expire
   */
  public isTokenExpired(bufferMinutes: number = 5): boolean {
    return this.oauth2.isTokenExpired(bufferMinutes);
  }

  /**
   * Get current tokens (useful for persistence)
   */
  public getTokens(): TokenData {
    return this.oauth2.getTokens();
  }

  /**
   * Manually trigger token refresh
   */
  public async refreshToken(): Promise<void> {
    await this.oauth2.refreshAccessToken();
  }

  /**
   * Get File
   */
  public async getFile(fileId: string): Promise<ApiResponse<FileMetadata>> {
    const { getFile } = await import("./functions/files/getFile");
    return getFile(this.oauth2, fileId);
  }

  /**
   * Move file to a different folder
   */
  public async moveFile(
    fileId: string,
    newFolderId: string
  ): Promise<ApiResponse<FileMetadata>> {
    const { moveFile } = await import("./functions/files/moveFile");
    return moveFile(this.oauth2, fileId, newFolderId);
  }

  /**
   * Read file data directly (returns Buffer or text)
   */
  public async readFileData(
    fileId: string,
    asText: boolean = true
  ): Promise<ApiResponse<string | Buffer>> {
    const { readFileData } = await import("./functions/files/readFileData");
    return readFileData(this.oauth2, fileId, asText);
  }

  /**
   * List files in Google Drive
   */
  public async listFiles(
    params: ListFilesParams = {}
  ): Promise<ApiResponse<ListFilesResponse>> {
    const { listFiles } = await import("./functions/files/listFiles");
    return listFiles(this.oauth2, params);
  }

  /**
   * Get file metadata
   */
  public async getFileMetadata(
    fileId: string
  ): Promise<ApiResponse<FileMetadata>> {
    const { getFileMetadata } = await import(
      "./functions/metadata/getFileMetadata"
    );
    return getFileMetadata(this.oauth2, fileId);
  }

  /**
   * Download file to local storage
   */
  public async downloadFile(
    fileId: string,
    destPath: string
  ): Promise<ApiResponse<{ path: string }>> {
    const { downloadFile } = await import("./functions/files/downloadFile");
    return downloadFile(this.oauth2, fileId, destPath);
  }

  /**
   * Upload file to Google Drive (multipart upload)
   */
  public async uploadFile(
    filePath: string,
    metadata: UploadFileMetadata = {}
  ): Promise<ApiResponse<FileMetadata>> {
    const { uploadFile } = await import("./functions/files/uploadFile");
    return uploadFile(this.oauth2, filePath, metadata);
  }

  /**
   * Update file content
   */
  public async updateFileContent(
    fileId: string,
    content: string,
    mimeType: string
  ) {
    const { updateFileContent } = await import(
      "./functions/files/updateFileContent"
    );
    return updateFileContent(this.oauth2, fileId, content, mimeType);
  }

  /**
   * Update file metadata
   */
  public async updateFileMetadata(
    fileId: string,
    metadata: Partial<FileMetadata>
  ): Promise<ApiResponse<FileMetadata>> {
    const { updateFileMetadata } = await import(
      "./functions/metadata/updateFileMetadata"
    );
    return updateFileMetadata(this.oauth2, fileId, metadata);
  }

  /**
   * Delete file from Google Drive
   */
  public async deleteFile(
    fileId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const { deleteFile } = await import("./functions/files/deleteFile");
    return deleteFile(this.oauth2, fileId);
  }

  /**
   * Create folder in Google Drive
   */
  public async createFolder(
    folderName: string,
    parentFolderId?: string
  ): Promise<ApiResponse<FileMetadata>> {
    const { createFolder } = await import("./functions/folders/createFolder");
    return createFolder(this.oauth2, folderName, parentFolderId);
  }

  /**
   * Update JSON file content directly (without needing local file)
   */
  public async updateJsonContent(
    fileId: string,
    jsonData: Record<string, any>
  ): Promise<ApiResponse<FileMetadata>> {
    const { updateJsonContent } = await import(
      "./functions/json/updateJsonContent"
    );
    return updateJsonContent(this.oauth2, fileId, jsonData);
  }

  /**
   * Add a new key-value pair to a JSON file in Google Drive.
   * If the key already exists, it will be overwritten.
   */
  public async addJsonContent(
    fileId: string,
    key: string,
    value: any
  ): Promise<ApiResponse<FileMetadata>> {
    const { addJsonContent } = await import("./functions/json/addJsonContent");
    return addJsonContent(this.oauth2, fileId, key, value);
  }

  /**
   * Search files by query
   */
  public async searchFiles(
    searchQuery: string,
    pageSize: number = 10
  ): Promise<ApiResponse<ListFilesResponse>> {
    const { searchFiles } = await import("./functions/search/searchFiles");
    return searchFiles(this.oauth2, searchQuery, pageSize);
  }

  /**
   * Get image metadata for a file
   */
  public async getImageMetadata(
    fileId: string
  ): Promise<ApiResponse<ImageMediaMetadata>> {
    const { getImageMetadata } = await import(
      "./functions/metadata/getImageMetadata"
    );
    return getImageMetadata(this.oauth2, fileId);
  }

  /**
   * Get video metadata for a file
   */
  public async getVideoMetadata(
    fileId: string
  ): Promise<ApiResponse<VideoMediaMetadata>> {
    const { getVideoMetadata } = await import(
      "./functions/metadata/getVideoMetadata"
    );
    return getVideoMetadata(this.oauth2, fileId);
  }

  /**
   * Create a JSON file on Google Drive
   */
  public async createJsonFile(jsonContent: string, name: string) {
    const { createJsonFile } = await import("./functions/json/createJsonFile");
    return createJsonFile(this.oauth2, jsonContent, name);
  }

  /**
   * Get complete file metadata including image/video metadata
   */
  public async getCompleteFileMetadata(
    fileId: string
  ): Promise<ApiResponse<FileMetadata>> {
    const { getCompleteFileMetadata } = await import(
      "./functions/metadata/getCompleteFileMetadata"
    );
    return getCompleteFileMetadata(this.oauth2, fileId);
  }

  /**
   * Get storageQuota
   */
  public async getStorageQuota(): Promise<ApiResponse<StorageQuota>> {
    const { getStorageQuota } = await import(
      "./functions/storage/getStorageQuota"
    );
    return getStorageQuota(this.oauth2);
  }

  /**
   * Share File
   */
  public async shareFile(
    fileId: string,
    emailAddress: string,
    role: string = "reader"
  ): Promise<ApiResponse<void>> {
    const { shareFile } = await import("./functions/permissions/shareFile");
    return shareFile(this.oauth2, fileId, emailAddress, role);
  }

  /**
   * Convert Regular File to Google Docs
   */
  public async ConversionFunction(
    fileId: string,
    targetMimeType: string
  ): Promise<ApiResponse<FileMetadata>> {
    const { ConversionFunction } = await import(
      "./functions/conversion/ConversionFunction"
    );
    return ConversionFunction(this.oauth2, fileId, targetMimeType);
  }

  /**
   * Create stream for any Google Drive file (audio, video, image, doc, etc.)
   */
  public async createStream(
    fileId: string,
    targetMimeType?: string
  ): Promise<NodeJS.ReadableStream | null> {
    const { createStream } = await import("./functions/files/createStream");
    return createStream(this.oauth2, fileId, targetMimeType);
  }

  /**
   * Select json key value from google drive file
   */
  public async selectJsonContent(fileId: string): Promise<any> {
    const { selectJsonContent } = await import(
      "./functions/json/selectJsonContent"
    );
    return selectJsonContent(this.oauth2, fileId);
  }

  // Push new object to a JSON array field
  public async pushJsonObjectToArray(
    fileId: string,
    arrayPath: string,
    newObject: any
  ): Promise<any> {
    const { pushJsonObjectToArray } = await import(
      "./functions/json/pushJsonObjectToArray"
    );
    return pushJsonObjectToArray(this.oauth2, fileId, arrayPath, newObject);
  }

  /**
   * Zip a Drive folder (supports nested folders, password, and same-level saving)
   **/
  public async convertFilesAndFoldersToZip(options: {
    folderId?: string;
    fileIds?: string[];
    zipName: string;
    uploadToFolderId?: string;
    password?: string;
  }): Promise<{
    success: boolean;
    data?: { id: string; name: string; webViewLink: string };
    error?: string;
  }> {
    const { convertFilesAndFoldersToZip } = await import(
      "./functions/archive/convertFilesAndFoldersToZip"
    );
    return convertFilesAndFoldersToZip(this.oauth2, options);
  }

  public async createStreamfilesandFolder(
    fileId: string
  ): Promise<NodeJS.ReadableStream | null> {
    const { createStreamfilesandFolder } = await import(
      "./functions/files/createStreamfilesandFolder"
    );
    return createStreamfilesandFolder(this.oauth2, fileId);
  }

  /**
   * Finds and logs duplicate file and folder names in Drive (console-only version).
   */
  public async findDuplicate(): Promise<void> {
    const { findDuplicate } = await import("./functions/search/findDuplicate");
    return findDuplicate(this.oauth2);
  }

  /**
   * Encrypt plain text with password + salt using AES-256-GCM
   * Returns base64(iv + authTag + ciphertext)
   */
  public async encryptText(
    plainText: string,
    password: string,
    salt: string
  ): Promise<ApiResponse<string>> {
    const { encryptText } = await import("./functions/encryption/encryptText");
    return encryptText(plainText, password, salt);
  }

  /**
   * Decrypt text using same password + salt
   * Input must be base64(iv + authTag + ciphertext)
   */
  public async decryptText(
    encryptedBase64: string,
    password: string,
    salt: string
  ): Promise<ApiResponse<string>> {
    const { decryptText } = await import("./functions/encryption/decryptText");
    return decryptText(encryptedBase64, password, salt);
  }

  public async getFileTypeBreakdown(
    parentId: string = "root"
  ): Promise<Record<string, number>> {
    const { getFileTypeBreakdown } = await import(
      "./functions/metadata/getFileTypeBreakdown"
    );
    return getFileTypeBreakdown(this.oauth2, parentId);
  }

  public async getAllFilesInParent(
    parentId: string
  ): Promise<Array<{ name: string; id: string; mimeType: string }>> {
    const { getAllFilesInParent } = await import(
      "./functions/files/getAllFilesInParent"
    );
    return getAllFilesInParent(this.oauth2, parentId);
  }

  /**
   * Watch a single Google Drive folder (NON-recursive)
   * Detects file add / modify / delete
   */
  public async watchFolder(
    folderId: string,
    intervalMs: number = 4000,
    callback: (event: {
      type: "added" | "modified" | "deleted";
      file: FileMetadata;
    }) => void
  ) {
    const { watchFolder } = await import("./functions/watcher/watchFolder");
    return watchFolder(this.oauth2, folderId, intervalMs, callback);
  }

  /**
   * Recursive folder watcher (subfolders included)
   * Detects EVERYTHING happening inside the folder tree.
   */
  public async watchFolderDeep(
    folderId: string,
    intervalMs: number = 4000,
    callback: (event: {
      type: "added" | "modified" | "deleted";
      file: FileMetadata;
    }) => void
  ) {
    const { watchFolderDeep } = await import(
      "./functions/watcher/watchFolderDeep"
    );
    return watchFolderDeep(this.oauth2, folderId, intervalMs, callback);
  }

  // Google Apps Script Management
  public async createScriptProject(title: string, code: string) {
    const { createScriptProject } = await import(
      "./functions/scripts/createScriptProject"
    );
    return createScriptProject(this.oauth2, title, code);
  }

  public async updateScriptProject(scriptId: string, files: any[]) {
    const { updateScriptProject } = await import(
      "./functions/scripts/updateScriptProject"
    );
    return updateScriptProject(this.oauth2, scriptId, files);
  }

  public async deleteScriptProject(scriptId: string) {
    const { deleteScriptProject } = await import(
      "./functions/scripts/deleteScriptProject"
    );
    return deleteScriptProject(this.oauth2, scriptId);
  }

  public async DeployScript(scriptId: string) {
    const { DeployScript } = await import("./functions/scripts/DeployScript");
    return DeployScript(this.oauth2, scriptId);
  }

  public async runScript(
    scriptId: string,
    functionName: string,
    parameters?: any[],
    devMode?: boolean
  ) {
    const { runScript } = await import("./functions/scripts/runScript");
    return runScript(this.oauth2, scriptId, functionName, parameters, devMode);
  }
}
