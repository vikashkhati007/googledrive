import { driveService } from "../../drivers/services";

/**
 * Update a Google Script project
 */
export async function updateGoogleScript(scriptId: string, code: string) {
  const res = await driveService.updateScriptProject(scriptId, code);
  if (res.success) return res.data;
  throw new Error(res.error || "Failed to update script");
}
