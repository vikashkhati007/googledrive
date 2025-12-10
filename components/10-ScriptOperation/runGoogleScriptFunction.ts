import { runScriptProject } from "../../drivers/functions/scripts/runScriptProject";
import { driveService } from "../../drivers/services";

/**
 * Execute a Google Script Web App
 */
export const runGoogleScript = {
  /**
   * Fetch an HTML page from the script URL
   */
  Html: (url: string) =>
    driveService.runScriptProject(url, undefined, {}, "HTML"),

  /**
   * Call an API endpoint on the script
   */
  API: (url: string, params: Record<string, any> = {}) =>
    driveService.runScriptProject(url, undefined, params, "API"),

  /**
   * Call a specific function (RPC style)
   */
  Function: (
    url: string,
    functionName: string,
    params: Record<string, any> = {}
  ) => driveService.runScriptProject(url, functionName, params, "FUNCTION"),
};

/**
 * Legacy support for runGoogleScriptFunction
 * @deprecated Use runGoogleScript.Function instead
 */
export async function runGoogleScriptFunction(
  url: string,
  functionName?: string,
  parameters: Record<string, any> = {},
  projectType: any = "FUNCTION"
) {
  return driveService.runScriptProject(
    url,
    functionName,
    parameters,
    projectType
  );
}
