import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";
import { Buffer } from "buffer";

export async function readFileData(
  oauth2: OAuth2Client,
  fileId: string,
  asText: boolean = true
): Promise<ApiResponse<string | Buffer>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
      {
        headers: authHeader,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const arrayBuffer = await response.arrayBuffer();
    const dataBuffer = Buffer.from(arrayBuffer);

    return {
      success: true,
      data: asText ? dataBuffer.toString("utf-8") : dataBuffer,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
