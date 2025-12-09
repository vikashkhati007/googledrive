import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";

export async function runScript(
  oauth2: OAuth2Client,
  scriptId: string,
  functionName: string,
  parameters: any[] = [],
  devMode: boolean = false
) {
  try {
    const authHeader = await oauth2.getAuthHeader();

    const response = await fetch(`${SCRIPT_API_BASE}/scripts/${scriptId}:run`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        function: functionName,
        parameters,
        devMode,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) || {
        error: await response.text(),
      };
      throw new Error(errorData.error?.message || JSON.stringify(errorData));
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    return {
      success: true,
      data: data.response?.result,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
