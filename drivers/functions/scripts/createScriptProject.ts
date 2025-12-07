import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";

export async function createScriptProject(
  oauth2: OAuth2Client,
  title: string,
  code: string
) {
  try {
    const authHeader = await oauth2.getAuthHeader();

    // Create blank project
    const createResponse = await fetch(`${SCRIPT_API_BASE}/projects`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!createResponse.ok) {
      throw new Error(await createResponse.text());
    }

    const project = await createResponse.json();
    const scriptId = project.scriptId!;

    // Correct manifest
    const manifest = {
      timeZone: "Asia/Kolkata",
      exceptionLogging: "STACKDRIVER",
      runtimeVersion: "V8",
      webapp: {
        access: "ANYONE",
        executeAs: "USER_DEPLOYING",
      },
    };

    const content = [
      {
        name: "appsscript",
        type: "JSON",
        source: JSON.stringify(manifest, null, 2),
      },
      {
        name: "Code",
        type: "SERVER_JS",
        source: code,
      },
    ];

    const updateResponse = await fetch(
      `${SCRIPT_API_BASE}/projects/${scriptId}/content`,
      {
        method: "PUT",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: content }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(await updateResponse.text());
    }

    return {
      success: true,
      data: { scriptId },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
