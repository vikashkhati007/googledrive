import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types";
import { DRIVE_UPLOAD_BASE } from "../../../const";

export async function updateJsonContent(
  oauth2: OAuth2Client,
  fileId: string,
  jsonData: Record<string, any>
): Promise<ApiResponse<FileMetadata>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media&fields=id,name,mimeType,modifiedTime,webViewLink`,
      {
        method: "PATCH",
        headers: {
          ...authHeader,
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
