import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, StorageQuota } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";
import { client } from "../../jirenClient";

export async function getStorageQuota(
  oauth2: OAuth2Client
): Promise<ApiResponse<StorageQuota>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = client.get(`${DRIVE_API_BASE}/about?fields=storageQuota`, {
      headers: authHeader,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = response.json();
    return { success: true, data: data.storageQuota as StorageQuota };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
