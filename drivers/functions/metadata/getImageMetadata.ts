import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, ImageMediaMetadata } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";
import { client } from "../../Client";

export async function getImageMetadata(
  oauth2: OAuth2Client,
  fileId: string
): Promise<ApiResponse<ImageMediaMetadata>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await client.get(
      `${DRIVE_API_BASE}/files/${fileId}?fields=imageMediaMetadata`,
      { headers: authHeader }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.imageMediaMetadata as ImageMediaMetadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
