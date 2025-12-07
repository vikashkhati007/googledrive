import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types/index";
import { fetchWithAuth } from "../utils";
import { DRIVE_API_BASE } from "../../../const/index";

/**
 * Create folder in Google Drive
 */
export async function createFolder(
  client: OAuth2Client,
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

    const response = await fetchWithAuth(
      client,
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
