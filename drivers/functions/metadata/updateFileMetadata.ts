import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";
import { client } from "../../Client";

export async function updateFileMetadata(
  oauth2: OAuth2Client,
  fileId: string,
  metadata: Partial<FileMetadata>
): Promise<ApiResponse<FileMetadata>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await client.patch(
      `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime`,
      JSON.stringify(metadata),
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
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
