import * as fs from "fs";
import * as path from "path";
import { OAuth2Client } from "../../oauth2-client";
import {
  ApiResponse,
  FileMetadata,
  UploadFileMetadata,
} from "../../../types/index";
import { fetchWithAuth } from "../utils";
import { DRIVE_UPLOAD_BASE } from "../../../const/index";

/**
 * Upload file to Google Drive (multipart upload)
 */
export async function uploadFile(
  client: OAuth2Client,
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

    const response = await fetchWithAuth(
      client,
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
