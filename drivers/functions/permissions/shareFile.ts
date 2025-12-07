import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";

export async function shareFile(
  oauth2: OAuth2Client,
  fileId: string,
  emailAddress: string,
  role: string = "reader"
): Promise<ApiResponse<void>> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "user",
          role: role,
          emailAddress: emailAddress,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
