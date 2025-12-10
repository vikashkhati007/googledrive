import { OAuth2Client } from "../../oauth2-client";
import { ScriptProjectType } from "./createScriptProject";

/**
 * Call a Google Apps Script Web App URL with parameters
 */
export async function runScriptProject(
  oauth2: OAuth2Client,
  url: string,
  functionName?: string,
  parameters: Record<string, any> = {},
  projectType: ScriptProjectType = "FUNCTION"
) {
  try {
    const urlObj = new URL(url);

    if (projectType === "FUNCTION") {
      if (!functionName) {
        throw new Error("functionName is required for FUNCTION project type");
      }
      // Set the fixed 'func' parameter for dispatcher
      urlObj.searchParams.append("func", functionName);
    }

    // Append parameters
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const strValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        urlObj.searchParams.append(key, strValue);
      }
    });

    const response = await fetch(urlObj.toString(), {
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(
        `Web App call failed: ${response.status} ${response.statusText}`
      );
    }

    const text = await response.text();

    // Parse response based on type
    if (projectType === "HTML") {
      return text; // Return raw HTML
    }

    // For FUNCTION and API, try to parse JSON
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err: any) {
    throw new Error("Failed to call Web App: " + (err.message || err));
  }
}
