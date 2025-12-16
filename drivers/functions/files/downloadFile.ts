import * as fs from "fs";
import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse } from "../../../types/index";
import { DRIVE_API_BASE } from "../../../const/index";

/**
 * Download file to local storage
 */
export async function downloadFile(
  client: OAuth2Client,
  fileId: string,
  destPath: string
): Promise<ApiResponse<{ path: string }>> {
  try {
    const authHeader = await client.getAuthHeader();
    // Note: Using native fetch for binary download support
    // Jiren doesn't support arrayBuffer() method
    const response = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
      { headers: authHeader }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));

    return { success: true, data: { path: destPath } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
