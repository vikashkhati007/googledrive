import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types";
import { DRIVE_API_BASE, DRIVE_UPLOAD_BASE, MIME_TYPES } from "../../../const";
import { Buffer } from "buffer";
import { client } from "../../jirenClient";

export async function ConversionFunction(
  oauth2: OAuth2Client,
  fileId: string,
  targetMimeType: string
): Promise<ApiResponse<FileMetadata>> {
  try {
    const authHeader = await oauth2.getAuthHeader();

    // Step 1: Get file metadata
    const metaResponse = client.get(
      `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType`,
      { headers: authHeader }
    );

    if (!metaResponse.ok) {
      throw new Error(await metaResponse.text());
    }

    const originalFile = metaResponse.json();
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

      const exportResponse = await fetch(
        `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(
          targetMimeType
        )}`,
        { headers: authHeader }
      );

      if (!exportResponse.ok) {
        throw new Error(await exportResponse.text());
      }

      fileContent = await exportResponse.arrayBuffer();
    } else {
      console.log("📦 Downloading binary file...");
      const downloadResponse = await fetch(
        `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
        { headers: authHeader }
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

    const uploadResponse = await fetch(
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime`,
      {
        method: "POST",
        headers: {
          ...authHeader,
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
