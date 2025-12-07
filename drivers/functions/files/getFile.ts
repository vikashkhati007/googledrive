import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types/index";
import { fetchWithAuth } from "../utils";
import { DRIVE_API_BASE } from "../../../const/index";

/**
 * Get File
 */
export async function getFile(
  client: OAuth2Client,
  fileId: string
): Promise<ApiResponse<FileMetadata>> {
  try {
    const fields =
      "id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink";
    const response = await fetchWithAuth(
      client,
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
