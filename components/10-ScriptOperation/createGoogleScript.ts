import { driveService } from "../../drivers/services";
import { ScriptProjectType } from "../../drivers/functions/scripts/createScriptProject";

/**
 * Core function for creating script projects
 */
async function createScript(
  title: string,
  code: string,
  projectType: ScriptProjectType
) {
  const res = await driveService.createScriptProject(title, code, projectType);
  if (res.success && res.data) return res.data;
  throw new Error(res.error || "Failed to create Google Script");
}

/**
 * Create a new Google Script project
 */
export const createGoogleScript = {
  /**
   * Create an HTML project.
   * @param title Title of the script project
   * @param htmlContent The content of index.html
   */
  Html: (title: string, htmlContent: string) =>
    createScript(title, htmlContent, "HTML"),

  /**
   * Create an API project.
   * @param title Title of the script project
   * @param code The code containing function apiMain(params) { ... }
   */
  API: (title: string, code: string) => createScript(title, code, "API"),

  /**
   * Create a generic Function project (RPC style).
   * @param title Title of the script project
   * @param code The code containing your functions
   */
  Function: (title: string, code: string) =>
    createScript(title, code, "FUNCTION"),
};
