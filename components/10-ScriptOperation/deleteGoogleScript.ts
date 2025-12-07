import { driveService } from "../../drivers/services";

/**
 * Delete a Google Script project (Move to Trash)
 */
export async function deleteGoogleScript(scriptId: string) {
  const res = await driveService.deleteScriptProject(scriptId);
  if (res.success) return res.data;
  throw new Error(res.error || "Failed to delete script");
}
