import { driveService } from "../../drivers/services";

/**
 * Update a Google Script project
 */
export async function updateGoogleScript(scriptId: string, files: any[]) {
  const res = await driveService.updateScriptProject(scriptId, files);
  if (res.success) return res.data;
  throw new Error(res.error || "Failed to update script");
}
