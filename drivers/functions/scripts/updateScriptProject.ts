import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";

export async function updateScriptProject(
  oauth2: OAuth2Client,
  scriptId: string,
  code: string
) {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${SCRIPT_API_BASE}/projects/${scriptId}/content`,
      {
        method: "PUT",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: [
            {
              name: "Code",
              type: "SERVER_JS",
              source: code,
            },
          ],
        }),
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
