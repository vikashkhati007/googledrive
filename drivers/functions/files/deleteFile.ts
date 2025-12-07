import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse } from "../../../types/index";
import { fetchWithAuth } from "../utils";
import { DRIVE_API_BASE } from "../../../const/index";

/**
 * Delete file from Google Drive
 */
export async function deleteFile(
  client: OAuth2Client,
  fileId: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetchWithAuth(
      client,
      `${DRIVE_API_BASE}/files/${fileId}`,
      {
        method: "DELETE",
      }
    );

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
