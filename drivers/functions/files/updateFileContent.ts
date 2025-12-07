import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_UPLOAD_BASE } from "../../../const";

export async function updateFileContent(
  oauth2: OAuth2Client,
  fileId: string,
  content: string,
  mimeType: string
) {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": mimeType,
        },
        body: content,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error: any) {
    console.error("❌ Error updating file content:", error.message);
    throw error;
  }
}
