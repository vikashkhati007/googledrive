import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";
import { client } from "../../Client";

export async function DeployScript(oauth2: OAuth2Client, scriptId: string) {
  try {
    const authHeader = await oauth2.getAuthHeader();

    // Create version
    const versionResponse = await client.post(
      `${SCRIPT_API_BASE}/projects/${scriptId}/versions`,
      JSON.stringify({ description: "Auto version" }),
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!versionResponse.ok) {
      throw new Error(await versionResponse.text());
    }

    const version = await versionResponse.json();
    const versionNumber = version.versionNumber;

    // Deploy using MANIFEST
    const deployResponse = await client.post(
      `${SCRIPT_API_BASE}/projects/${scriptId}/deployments`,
      JSON.stringify({ versionNumber, manifestFileName: "appsscript" }),
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!deployResponse.ok) {
      throw new Error(await deployResponse.text());
    }

    const deployment = await deployResponse.json();

    const webApp = deployment.entryPoints?.find(
      (e: any) => e.entryPointType === "WEB_APP"
    );

    return {
      success: true,
      data: {
        deploymentId: deployment.deploymentId,
        webAppUrl: webApp?.webApp?.url,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
