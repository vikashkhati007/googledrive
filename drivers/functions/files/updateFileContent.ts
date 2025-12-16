import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_UPLOAD_BASE } from "../../../const";
import { client } from "../../jirenClient";

export async function updateFileContent(
  oauth2: OAuth2Client,
  fileId: string,
  content: string,
  mimeType: string
) {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = client.patch(
      `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`,
      content,
      {
        headers: {
          ...authHeader,
          "Content-Type": mimeType,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return response.json();
  } catch (error: any) {
    console.error("❌ Error updating file content:", error.message);
    throw error;
  }
}
