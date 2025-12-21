import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";
import { client } from "../../Client";

export async function updateScriptProject(
  oauth2: OAuth2Client,
  scriptId: string,
  files: any[]
) {
  try {
    const authHeader = await oauth2.getAuthHeader();
    // Note: Using PATCH as Jiren doesn't have PUT
    const response = await client.patch(
      `${SCRIPT_API_BASE}/projects/${scriptId}/content`,
      JSON.stringify({ files: files }),
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

    const data = await response.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
