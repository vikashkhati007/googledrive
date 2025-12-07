import { OAuth2Client } from "../../oauth2-client";
import { FileMetadata } from "../../../types";
import { DRIVE_UPLOAD_BASE } from "../../../const";

export async function createJsonFile(
  oauth2: OAuth2Client,
  jsonContent: string,
  name: string
) {
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

    const authHeader = await oauth2.getAuthHeader();

    const response = await fetch(
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink`,
      {
        method: "POST",
        headers: {
          ...authHeader,
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
