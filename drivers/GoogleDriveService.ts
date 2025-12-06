import * as fs from "fs";
import * as path from "path";
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
import { MIME_LABELS, MIME_TYPES } from "../const/index";
import archiver from "archiver";
import archiverZipEncrypted from "archiver-zip-encrypted";
import { Readable, PassThrough } from "stream";
import * as crypto from "crypto";
import { OAuth2Client } from "./oauth2-client";

(archiver as any).registerFormat("zip-encrypted", archiverZipEncrypted);

// Google Drive API base URLs
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
const SCRIPT_API_BASE = "https://script.googleapis.com/v1";

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
   * Helper method to make authenticated fetch requests
   */
  private async fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const authHeader = await this.oauth2.getAuthHeader();
    const headers = {
      ...authHeader,
      ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });
    return response;
  }

  /**
   * Get File
   */
  public async getFile(fileId: string): Promise<ApiResponse<FileMetadata>> {
    try {
      const fields =
        "id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink";
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=${encodeURIComponent(fields)}`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Read file data directly (returns Buffer or text)
   */
  public async readFileData(
    fileId: string,
    asText: boolean = true
  ): Promise<ApiResponse<string | Buffer>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?alt=media`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const arrayBuffer = await response.arrayBuffer();
      const dataBuffer = Buffer.from(arrayBuffer);

      return {
        success: true,
        data: asText ? dataBuffer.toString("utf-8") : dataBuffer,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * List files in Google Drive
   */
  public async listFiles(
    params: ListFilesParams = {}
  ): Promise<ApiResponse<ListFilesResponse>> {
    try {
      const queryParams = new URLSearchParams({
        pageSize: String(params.pageSize || 10),
        fields:
          "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime)",
        orderBy: params.orderBy || "modifiedTime desc",
      });

      if (params.query) {
        queryParams.set("q", params.query);
      }
      if (params.pageToken) {
        queryParams.set("pageToken", params.pageToken);
      }

      const response = await this.fetch(
        `${DRIVE_API_BASE}/files?${queryParams.toString()}`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          files: data.files as FileMetadata[],
          nextPageToken: data.nextPageToken || undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get file metadata
   */
  public async getFileMetadata(
    fileId: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const fields =
        "id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink";
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=${encodeURIComponent(fields)}`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Download file to local storage
   */
  public async downloadFile(
    fileId: string,
    destPath: string
  ): Promise<ApiResponse<{ path: string }>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?alt=media`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(arrayBuffer));

      return { success: true, data: { path: destPath } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Upload file to Google Drive (multipart upload)
   */
  public async uploadFile(
    filePath: string,
    metadata: UploadFileMetadata = {}
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const fileContent = fs.readFileSync(filePath);
      const fileName = metadata.name || path.basename(filePath);

      const fileMetadata: any = {
        name: fileName,
        parents: metadata.parents || [],
      };

      // Create multipart body
      const boundary = "-------314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadataPart =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(fileMetadata);

      const mediaPart =
        delimiter +
        `Content-Type: ${
          metadata.mimeType || "application/octet-stream"
        }\r\n\r\n`;

      const body = Buffer.concat([
        Buffer.from(metadataPart),
        Buffer.from(mediaPart),
        fileContent,
        Buffer.from(closeDelimiter),
      ]);

      const response = await this.fetch(
        `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink`,
        {
          method: "POST",
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update file content
   */
  public async updateFileContent(
    fileId: string,
    content: string,
    mimeType: string
  ) {
    try {
      const response = await this.fetch(
        `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": mimeType,
          },
          body: content,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return await response.json();
    } catch (error: any) {
      console.error("❌ Error updating file content:", error.message);
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  public async updateFileMetadata(
    fileId: string,
    metadata: Partial<FileMetadata>
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete file from Google Drive
   */
  public async deleteFile(
    fileId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return {
        success: true,
        data: { message: "File deleted successfully" },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create folder in Google Drive
   */
  public async createFolder(
    folderName: string,
    parentFolderId?: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const fileMetadata: any = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.fetch(
        `${DRIVE_API_BASE}/files?fields=id,name,mimeType`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fileMetadata),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update JSON file content directly (without needing local file)
   */
  public async updateJsonContent(
    fileId: string,
    jsonData: Record<string, any>
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.fetch(
        `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media&fields=id,name,mimeType,modifiedTime,webViewLink`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonData, null, 2),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
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
    try {
      // Step 1: Read existing JSON content
      const fileData = await this.readFileData(fileId, true);
      if (!fileData.success) {
        throw new Error(fileData.error || "Failed to read JSON file data");
      }

      // Step 2: Parse the JSON
      let jsonData: Record<string, any>;
      try {
        jsonData = JSON.parse(fileData.data as string);
      } catch {
        throw new Error("Invalid JSON format in file");
      }

      // Step 3: Add or overwrite key
      jsonData[key] = value;

      // Step 4: Upload updated JSON content
      return await this.updateJsonContent(fileId, jsonData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search files by query
   */
  public async searchFiles(
    searchQuery: string,
    pageSize: number = 10
  ): Promise<ApiResponse<ListFilesResponse>> {
    return this.listFiles({
      query: searchQuery,
      pageSize: pageSize,
    });
  }

  /**
   * Get image metadata for a file
   */
  public async getImageMetadata(
    fileId: string
  ): Promise<ApiResponse<ImageMediaMetadata>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=imageMediaMetadata`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.imageMediaMetadata as ImageMediaMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get video metadata for a file
   */
  public async getVideoMetadata(
    fileId: string
  ): Promise<ApiResponse<VideoMediaMetadata>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=videoMediaMetadata`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.videoMediaMetadata as VideoMediaMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a JSON file on Google Drive
   */
  public async createJsonFile(jsonContent: string, name: string) {
    try {
      // Create multipart body
      const boundary = "-------314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const fileMetadata = { name, mimeType: "application/json" };

      const metadataPart =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(fileMetadata);

      const mediaPart =
        delimiter + "Content-Type: application/json\r\n\r\n" + jsonContent;

      const body = metadataPart + mediaPart + closeDelimiter;

      const response = await this.fetch(
        `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink`,
        {
          method: "POST",
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get complete file metadata including image/video metadata
   */
  public async getCompleteFileMetadata(
    fileId: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=*`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data as FileMetadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get storageQuota
   */
  public async getStorageQuota(): Promise<ApiResponse<StorageQuota>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/about?fields=storageQuota`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      return { success: true, data: data.storageQuota as StorageQuota };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Share File
   */
  public async shareFile(
    fileId: string,
    emailAddress: string,
    role: string = "reader"
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}/permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "user",
            role: role,
            emailAddress: emailAddress,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Convert Regular File to Google Docs
   */
  public async ConversionFunction(
    fileId: string,
    targetMimeType: string
  ): Promise<ApiResponse<FileMetadata>> {
    try {
      // Step 1: Get file metadata
      const metaResponse = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType`
      );

      if (!metaResponse.ok) {
        throw new Error(await metaResponse.text());
      }

      const originalFile = await metaResponse.json();
      const sourceMime = originalFile.mimeType || "application/octet-stream";
      const baseName = originalFile.name?.split(".")[0] || "Converted_File";

      let fileContent: ArrayBuffer;

      // Step 2: Handle different Google file types
      if (sourceMime.startsWith("application/vnd.google-apps.")) {
        console.log("🧾 Exporting Google Editor file...");

        const exportableTargets: Record<string, string[]> = {
          [MIME_TYPES.DOCUMENT]: [
            MIME_TYPES.PDF,
            MIME_TYPES.WORD,
            MIME_TYPES.TEXT,
          ],
          [MIME_TYPES.SPREADSHEET]: [
            MIME_TYPES.PDF,
            MIME_TYPES.CSV,
            MIME_TYPES.EXCEL,
          ],
          [MIME_TYPES.PRESENTATION]: [MIME_TYPES.PDF, MIME_TYPES.POWERPOINT],
          [MIME_TYPES.DRAWING]: [
            MIME_TYPES.PDF,
            MIME_TYPES.PNG,
            MIME_TYPES.JPEG,
            MIME_TYPES.SVG,
          ],
        };

        const allowedTargets = exportableTargets[sourceMime];
        if (!allowedTargets || !allowedTargets.includes(targetMimeType)) {
          return {
            success: false,
            error: `Export from ${sourceMime} to ${targetMimeType} not supported by Google Drive API.`,
          };
        }

        const exportResponse = await this.fetch(
          `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(
            targetMimeType
          )}`
        );

        if (!exportResponse.ok) {
          throw new Error(await exportResponse.text());
        }

        fileContent = await exportResponse.arrayBuffer();
      } else {
        console.log("📦 Downloading binary file...");
        const downloadResponse = await this.fetch(
          `${DRIVE_API_BASE}/files/${fileId}?alt=media`
        );

        if (!downloadResponse.ok) {
          throw new Error(await downloadResponse.text());
        }

        fileContent = await downloadResponse.arrayBuffer();
      }

      // Step 3: Upload new converted file
      const boundary = "-------314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const fileMetadata = {
        name: `${baseName}_converted`,
        mimeType: targetMimeType,
      };

      const metadataPart =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(fileMetadata);

      const mediaPart = delimiter + `Content-Type: ${sourceMime}\r\n\r\n`;

      const body = Buffer.concat([
        Buffer.from(metadataPart),
        Buffer.from(mediaPart),
        Buffer.from(fileContent),
        Buffer.from(closeDelimiter),
      ]);

      const uploadResponse = await this.fetch(
        `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime`,
        {
          method: "POST",
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(await uploadResponse.text());
      }

      const data = await uploadResponse.json();
      return { success: true, data: data as FileMetadata };
    } catch (error: any) {
      console.error("❌ Conversion Error:", error?.message || error);
      return {
        success: false,
        error: error?.message || "Conversion failed",
      };
    }
  }

  /**
   * Create stream for any Google Drive file (audio, video, image, doc, etc.)
   */
  public async createStream(
    fileId: string,
    targetMimeType?: string
  ): Promise<NodeJS.ReadableStream | null> {
    try {
      const metaResponse = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType`
      );

      if (!metaResponse.ok) {
        throw new Error(await metaResponse.text());
      }

      const file = await metaResponse.json();
      const sourceMime = file.mimeType || "application/octet-stream";

      let response: Response;

      if (sourceMime.startsWith("application/vnd.google-apps.")) {
        if (!targetMimeType) {
          throw new Error(
            "Target MIME type required for Google native files (like Docs or Sheets)"
          );
        }

        response = await this.fetch(
          `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(
            targetMimeType
          )}`
        );
      } else {
        response = await this.fetch(
          `${DRIVE_API_BASE}/files/${fileId}?alt=media`
        );
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Convert web ReadableStream to Node.js ReadableStream
      if (response.body) {
        return Readable.fromWeb(response.body as any);
      }

      return null;
    } catch (error: any) {
      console.error("❌ Stream creation failed:", error.message);
      return null;
    }
  }

  /**
   * Select json key value from google drive file
   */
  public async selectJsonContent(fileId: string): Promise<any> {
    try {
      const fileStream = await this.createStream(fileId, MIME_TYPES.JSON);
      if (!fileStream) {
        throw new Error("Failed to create stream for JSON file");
      }

      let jsonContent = "";
      for await (const chunk of fileStream) {
        jsonContent += chunk.toString();
      }

      const jsonData = JSON.parse(jsonContent);
      return jsonData;
    } catch (error: any) {
      console.error("❌ JSON selection failed:", error.message);
      return null;
    }
  }

  // Push new object to a JSON array field
  public async pushJsonObjectToArray(
    fileId: string,
    arrayPath: string,
    newObject: any
  ): Promise<any> {
    try {
      const fileStream = await this.createStream(fileId, MIME_TYPES.JSON);
      if (!fileStream) throw new Error("Failed to create stream for JSON file");

      let jsonContent = "";
      for await (const chunk of fileStream) {
        jsonContent += chunk.toString();
      }

      const jsonData = JSON.parse(jsonContent);

      if (arrayPath.trim() === "") {
        if (Array.isArray(jsonData)) {
          jsonData.push(newObject);
        } else {
          throw new Error("Root JSON is not an array");
        }
      } else {
        const keys = arrayPath.split(".");
        let current = jsonData;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!current[key]) current[key] = {};
          current = current[key];
        }

        const finalKey = keys[keys.length - 1];

        if (!Array.isArray(current[finalKey])) {
          current[finalKey] = current[finalKey] ? [current[finalKey]] : [];
        }

        current[finalKey].push(newObject);
      }

      const updatedFile = await this.updateFileContent(
        fileId,
        JSON.stringify(jsonData, null, 2),
        MIME_TYPES.JSON
      );

      return {
        success: true,
        data: updatedFile,
      };
    } catch (error: any) {
      console.error("❌ Error pushing new object:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
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
    console.log("🟢 Starting convertFilesAndFoldersToZip...");
    const {
      folderId,
      fileIds = [],
      zipName,
      uploadToFolderId,
      password,
    } = options;

    try {
      if (folderId && fileIds.length > 0) {
        throw new Error(
          "⚠️ You can select either a folder OR multiple files, not both."
        );
      }
      if (!folderId && fileIds.length === 0) {
        throw new Error("⚠️ Please select a folder or files to zip.");
      }

      // Step 1: Determine parent folder
      let parentFolderId = uploadToFolderId;
      if (!parentFolderId) {
        const referenceId = folderId || fileIds[0];
        const response = await this.fetch(
          `${DRIVE_API_BASE}/files/${referenceId}?fields=parents`
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const info = await response.json();
        const parents = info.parents;
        if (!parents || parents.length === 0) {
          throw new Error("⚠️ Could not determine parent folder.");
        }
        parentFolderId = parents[0];
      }

      // Step 2: Create streaming ZIP + PassThrough
      const archive = archiver((password ? "zip-encrypted" : "zip") as any, {
        zlib: { level: 9 },
        encryptionMethod: password ? "aes256" : undefined,
        password,
      });

      const passThrough = new PassThrough();
      archive.pipe(passThrough);

      // Collect all chunks for upload
      const chunks: Buffer[] = [];
      passThrough.on("data", (chunk) => chunks.push(chunk));

      // Step 3: Add files/folders to archive
      const addFolderToArchive = async (id: string, currentPath = "") => {
        const response = await this.fetch(
          `${DRIVE_API_BASE}/files?q='${id}' in parents and trashed=false&fields=files(id,name,mimeType)`
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const res = await response.json();
        const files = res.files || [];

        for (const file of files) {
          if (file.mimeType === "application/vnd.google-apps.folder") {
            await addFolderToArchive(file.id!, `${currentPath}${file.name}/`);
          } else {
            const stream = await this.createStreamfilesandFolder(file.id!);
            if (!stream) continue;

            const nodeStream =
              stream instanceof Readable
                ? stream
                : Readable.fromWeb(stream as any);

            archive.append(nodeStream, { name: `${currentPath}${file.name}` });
            console.log(`📦 Added: ${currentPath}${file.name}`);
          }
        }
      };

      if (folderId) {
        console.log("📁 Zipping folder...");
        await addFolderToArchive(folderId);
      } else {
        console.log("📄 Zipping multiple files...");
        for (const fileId of fileIds) {
          const metaResponse = await this.fetch(
            `${DRIVE_API_BASE}/files/${fileId}?fields=id,name`
          );

          if (!metaResponse.ok) continue;

          const meta = await metaResponse.json();
          const name = meta.name || `file_${fileId}`;
          const stream = await this.createStreamfilesandFolder(fileId);
          if (!stream) continue;

          const nodeStream =
            stream instanceof Readable
              ? stream
              : Readable.fromWeb(stream as any);

          archive.append(nodeStream, { name });
          console.log(`📦 Added file: ${name}`);
        }
      }

      // Step 4: Finalize archive
      await archive.finalize();

      // Wait for all chunks
      await new Promise<void>((resolve) => passThrough.on("end", resolve));
      const zipBuffer = Buffer.concat(chunks);

      // Step 5: Upload the ZIP file
      const boundary = "-------314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const fileMetadata = {
        name: zipName.endsWith(".zip") ? zipName : `${zipName}.zip`,
        parents: [parentFolderId],
      };

      const metadataPart =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(fileMetadata);

      const mediaPart = delimiter + "Content-Type: application/zip\r\n\r\n";

      const body = Buffer.concat([
        Buffer.from(metadataPart),
        Buffer.from(mediaPart),
        zipBuffer,
        Buffer.from(closeDelimiter),
      ]);

      const uploadResponse = await this.fetch(
        `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink`,
        {
          method: "POST",
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(await uploadResponse.text());
      }

      const uploadRes = await uploadResponse.json();

      console.log(
        `✅ Uploaded ZIP: ${uploadRes.webViewLink} ${
          password ? "(🔐 password protected)" : ""
        }`
      );

      return {
        success: true,
        data: {
          id: uploadRes.id!,
          name: uploadRes.name!,
          webViewLink: uploadRes.webViewLink!,
        },
      };
    } catch (err: any) {
      console.error("❌ convertFilesAndFoldersToZip failed:", err.message);
      return {
        success: false,
        error: err.message || "Unknown error",
      };
    }
  }

  public async createStreamfilesandFolder(
    fileId: string
  ): Promise<NodeJS.ReadableStream | null> {
    try {
      const metaResponse = await this.fetch(
        `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType`
      );

      if (!metaResponse.ok) {
        throw new Error(await metaResponse.text());
      }

      const meta = await metaResponse.json();
      const mimeType = meta.mimeType;

      const exportMap: Record<string, string> = {
        "application/vnd.google-apps.document":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.google-apps.spreadsheet":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.google-apps.presentation":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.google-apps.drawing": "image/png",
      };

      let response: Response;

      if (exportMap[mimeType!]) {
        console.log(`📤 Exporting ${meta.name} (${mimeType})`);
        response = await this.fetch(
          `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(
            exportMap[mimeType!]
          )}`
        );
      } else {
        response = await this.fetch(
          `${DRIVE_API_BASE}/files/${fileId}?alt=media`
        );
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (response.body) {
        return Readable.fromWeb(response.body as any);
      }

      return null;
    } catch (err: any) {
      console.warn(`⚠️ Failed to stream file ${fileId}:`, err.message);
      return null;
    }
  }

  /**
   * Finds and logs duplicate file and folder names in Drive (console-only version).
   */
  public async findDuplicate(): Promise<void> {
    try {
      console.log("\n🔍 Scanning Google Drive for duplicate names...");

      const files: any[] = [];
      let pageToken: string | undefined = undefined;

      do {
        const queryParams = new URLSearchParams({
          q: "trashed=false",
          fields: "nextPageToken,files(id,name,mimeType,parents)",
          pageSize: "1000",
        });

        if (pageToken) {
          queryParams.set("pageToken", pageToken);
        }

        const response = await this.fetch(
          `${DRIVE_API_BASE}/files?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const res = await response.json();
        files.push(...(res.files || []));
        pageToken = res.nextPageToken || undefined;
      } while (pageToken);

      console.log(`\n📁 Total items scanned: ${files.length}`);

      const nameMap: Record<string, any[]> = {};
      for (const f of files) {
        const name = f.name || "Untitled";
        if (!nameMap[name]) nameMap[name] = [];
        nameMap[name].push(f);
      }

      const duplicateFiles = Object.entries(nameMap)
        .filter(([_, arr]) => arr.length > 1)
        .sort((a, b) => b[1].length - a[1].length);

      if (duplicateFiles.length === 0) {
        console.log("\n✅ No duplicate names found! Drive looks clean.\n");
        return;
      }

      console.log(`\n⚠️ Found ${duplicateFiles.length} duplicate names:\n`);

      for (const [name, items] of duplicateFiles) {
        const type =
          items[0].mimeType === "application/vnd.google-apps.folder"
            ? "📁 Folder"
            : "📄 File";

        console.log(`${type} ${name} → (${items.length} duplicates)\n`);

        items.forEach((f, i) => {
          const id = f.id;
          const parent = f.parents?.[0]
            ? `Parent: ${f.parents[0]}`
            : "Parent: None";
          console.log(`   #${i + 1}  ID: ${id}  |  ${parent}`);
        });

        console.log("──────────────────────────────────────────────\n");
      }

      console.log("✨ Done! Duplicate analysis complete.\n");
    } catch (err: any) {
      console.error("❌ Error finding duplicates:", err.message || err);
    }
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
    try {
      const key = crypto.scryptSync(password, salt, 32);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

      const encrypted = Buffer.concat([
        cipher.update(plainText, "utf8"),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();

      const combined = Buffer.concat([iv, authTag, encrypted]);
      const base64Output = combined.toString("base64");

      return { success: true, data: base64Output };
    } catch (err: any) {
      console.error("❌ Encryption failed:", err.message);
      return { success: false, error: err.message || "Encryption failed" };
    }
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
    try {
      const key = crypto.scryptSync(password, salt, 32);
      const data = Buffer.from(encryptedBase64, "base64");

      const iv = data.subarray(0, 12);
      const authTag = data.subarray(12, 28);
      const ciphertext = data.subarray(28);

      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      return { success: true, data: decrypted.toString("utf8") };
    } catch (err: any) {
      console.error("❌ Decryption failed:", err.message);
      return { success: false, error: err.message || "Decryption failed" };
    }
  }

  public async getFileTypeBreakdown(
    parentId: string = "root"
  ): Promise<Record<string, number>> {
    const results: any[] = [];
    let pageToken: string | undefined = undefined;

    for (let i = 0; i < 20; i++) {
      const queryParams = new URLSearchParams({
        q: `'${parentId}' in parents and trashed = false`,
        fields: "nextPageToken,files(mimeType)",
        pageSize: "1000",
      });

      if (pageToken) {
        queryParams.set("pageToken", pageToken);
      }

      const response = await this.fetch(
        `${DRIVE_API_BASE}/files?${queryParams.toString()}`
      );

      if (!response.ok) break;

      const res = await response.json();
      results.push(res);

      if (!res.nextPageToken) break;
      pageToken = res.nextPageToken;
    }

    const typeCounts: Record<string, number> = {};
    results.forEach((res) => {
      for (const file of res.files || []) {
        const mime = file.mimeType || "unknown";
        typeCounts[mime] = (typeCounts[mime] || 0) + 1;
      }
    });

    const friendlyCounts: Record<string, number> = {};
    Object.entries(typeCounts).forEach(([mime, count]) => {
      const label = MIME_LABELS[mime] || mime;
      friendlyCounts[label] = (friendlyCounts[label] || 0) + count;
    });

    return friendlyCounts;
  }

  public async getAllFilesInParent(
    parentId: string
  ): Promise<Array<{ name: string; id: string; mimeType: string }>> {
    let pageToken: string | undefined = undefined;
    const results: Array<{ name: string; id: string; mimeType: string }> = [];

    for (let i = 0; i < 20; i++) {
      const queryParams = new URLSearchParams({
        q: `'${parentId}' in parents and trashed = false and mimeType != '${MIME_TYPES.FOLDER}'`,
        fields: "nextPageToken,files(name,id,mimeType)",
        pageSize: "1000",
      });

      if (pageToken) {
        queryParams.set("pageToken", pageToken);
      }

      const response = await this.fetch(
        `${DRIVE_API_BASE}/files?${queryParams.toString()}`
      );

      if (!response.ok) break;

      const res = await response.json();

      for (const file of res.files || []) {
        results.push({
          name: file.name,
          id: file.id,
          mimeType: file.mimeType,
        });
      }

      if (!res.nextPageToken) break;
      pageToken = res.nextPageToken;
    }

    return results;
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
    console.log(`👀 Watching folder: ${folderId}`);

    let previousState: Record<string, FileMetadata> = {};

    const fetchFiles = async () => {
      const response = await this.fetch(
        `${DRIVE_API_BASE}/files?q='${folderId}' in parents and trashed = false&fields=files(id,name,mimeType,modifiedTime,size)&pageSize=1000`
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const res = await response.json();
      const map: Record<string, FileMetadata> = {};

      for (const f of res.files || []) {
        map[f.id!] = f as FileMetadata;
      }

      return map;
    };

    previousState = await fetchFiles();

    setInterval(async () => {
      try {
        const newState = await fetchFiles();

        for (const id of Object.keys(newState)) {
          if (!previousState[id]) {
            callback({ type: "added", file: newState[id] });
          }
        }

        for (const id of Object.keys(newState)) {
          const oldFile = previousState[id];
          const newFile = newState[id];
          if (!oldFile) continue;

          if (newFile.modifiedTime !== oldFile.modifiedTime) {
            callback({ type: "modified", file: newFile });
          }
        }

        for (const id of Object.keys(previousState)) {
          if (!newState[id]) {
            callback({ type: "deleted", file: previousState[id] });
          }
        }

        previousState = newState;
      } catch (err: any) {
        console.log("⚠️ Watcher error:", err.message);
      }
    }, intervalMs);
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
    console.log(`👁️ Watching folder recursively: ${folderId}`);

    let previousState: Record<string, FileMetadata> = {};

    const fetchAll = async (
      id: string
    ): Promise<Record<string, FileMetadata>> => {
      let map: Record<string, FileMetadata> = {};

      const response = await this.fetch(
        `${DRIVE_API_BASE}/files?q='${id}' in parents and trashed = false&fields=files(id,name,mimeType,modifiedTime,parents)&pageSize=1000`
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const res = await response.json();
      const items = res.files || [];

      for (const item of items) {
        map[item.id!] = item as FileMetadata;

        if (item.mimeType === "application/vnd.google-apps.folder") {
          const childMap = await fetchAll(item.id!);
          map = { ...map, ...childMap };
        }
      }

      return map;
    };

    previousState = await fetchAll(folderId);

    setInterval(async () => {
      try {
        const newState = await fetchAll(folderId);

        for (const id of Object.keys(newState)) {
          if (!previousState[id]) {
            callback({ type: "added", file: newState[id] });
          }
        }

        for (const id of Object.keys(newState)) {
          const oldFile = previousState[id];
          const newFile = newState[id];
          if (!oldFile) continue;

          if (newFile.modifiedTime !== oldFile.modifiedTime) {
            callback({ type: "modified", file: newFile });
          }
        }

        for (const id of Object.keys(previousState)) {
          if (!newState[id]) {
            callback({ type: "deleted", file: previousState[id] });
          }
        }

        previousState = newState;
      } catch (err: any) {
        console.log("⚠️ Recursive watcher error:", err.message);
      }
    }, intervalMs);
  }

  // Google Apps Script Management
  public async createScriptProject(title: string, code: string) {
    try {
      // Create blank project
      const createResponse = await this.fetch(`${SCRIPT_API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!createResponse.ok) {
        throw new Error(await createResponse.text());
      }

      const project = await createResponse.json();
      const scriptId = project.scriptId!;

      // Correct manifest
      const manifest = {
        timeZone: "Asia/Kolkata",
        exceptionLogging: "STACKDRIVER",
        runtimeVersion: "V8",
        webapp: {
          access: "ANYONE",
          executeAs: "USER_DEPLOYING",
        },
      };

      const content = [
        {
          name: "appsscript",
          type: "JSON",
          source: JSON.stringify(manifest, null, 2),
        },
        {
          name: "Code",
          type: "SERVER_JS",
          source: code,
        },
      ];

      const updateResponse = await this.fetch(
        `${SCRIPT_API_BASE}/projects/${scriptId}/content`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: content }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(await updateResponse.text());
      }

      return {
        success: true,
        data: { scriptId },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async updateScriptProject(scriptId: string, code: string) {
    try {
      const response = await this.fetch(
        `${SCRIPT_API_BASE}/projects/${scriptId}/content`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            files: [
              {
                name: "Code",
                type: "SERVER_JS",
                source: code,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async deleteScriptProject(scriptId: string) {
    try {
      const response = await this.fetch(`${DRIVE_API_BASE}/files/${scriptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trashed: true }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return { success: true, data: "Script moved to trash" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async DeployScript(scriptId: string) {
    try {
      // Create version
      const versionResponse = await this.fetch(
        `${SCRIPT_API_BASE}/projects/${scriptId}/versions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: "Auto version",
          }),
        }
      );

      if (!versionResponse.ok) {
        throw new Error(await versionResponse.text());
      }

      const version = await versionResponse.json();
      const versionNumber = version.versionNumber;

      // Deploy using MANIFEST
      const deployResponse = await this.fetch(
        `${SCRIPT_API_BASE}/projects/${scriptId}/deployments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            versionNumber,
            manifestFileName: "appsscript",
          }),
        }
      );

      if (!deployResponse.ok) {
        throw new Error(await deployResponse.text());
      }

      const deployment = await deployResponse.json();

      const webApp = deployment.entryPoints?.find(
        (e: any) => e.entryPointType === "WEB_APP"
      );

      return {
        success: true,
        data: {
          deploymentId: deployment.deploymentId,
          webAppUrl: webApp?.webApp?.url,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
