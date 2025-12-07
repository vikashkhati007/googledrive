import { OAuth2Client } from "../../oauth2-client";
import {
  ApiResponse,
  ListFilesParams,
  ListFilesResponse,
  FileMetadata,
} from "../../../types/index";
import { fetchWithAuth } from "../utils";
import { DRIVE_API_BASE } from "../../../const/index";

/**
 * List files in Google Drive
 */
export async function listFiles(
  client: OAuth2Client,
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

    const response = await fetchWithAuth(
      client,
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
