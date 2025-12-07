import { driveService } from "../../drivers/services";

/**
 * Create a new Google Script project
 */
export async function createGoogleScript(title: string, code: string) {
  const res = await driveService.createScriptProject(title, code);
  if (res.success && res.data) return res.data;
  throw new Error(res.error || "Failed to create Google Script");
}
