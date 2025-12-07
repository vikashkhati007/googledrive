import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE } from "../../../const";

export async function deleteScriptProject(
  oauth2: OAuth2Client,
  scriptId: string
) {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(`${DRIVE_API_BASE}/files/${scriptId}`, {
      method: "PATCH",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trashed: true }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return { success: true, data: "Script moved to trash" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
