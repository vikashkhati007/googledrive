import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE } from "../../../const";
import { client } from "../../Client";

export async function deleteScriptProject(
  oauth2: OAuth2Client,
  scriptId: string
) {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await client.patch(
      `${DRIVE_API_BASE}/files/${scriptId}`,
      JSON.stringify({ trashed: true }),
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return { success: true, data: "Script moved to trash" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
