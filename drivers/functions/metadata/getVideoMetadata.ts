import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, VideoMediaMetadata } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";

export async function getVideoMetadata(
  oauth2: OAuth2Client,
  fileId: string
): Promise<ApiResponse<VideoMediaMetadata>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}?fields=videoMediaMetadata`,
      { headers: authHeader }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.videoMediaMetadata as VideoMediaMetadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
