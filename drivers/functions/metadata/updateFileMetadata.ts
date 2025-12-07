import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";

export async function updateFileMetadata(
  oauth2: OAuth2Client,
  fileId: string,
  metadata: Partial<FileMetadata>
): Promise<ApiResponse<FileMetadata>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime`,
      {
        method: "PATCH",
        headers: {
          ...authHeader,
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
