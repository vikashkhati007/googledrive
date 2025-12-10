import { driveService } from "../../drivers/services";

/**
 * Deploy a Google Script project
 */
export async function deployGoogleScript(scriptId: string) {
  const res = await driveService.DeployScript(scriptId);
  if (res.success && res.data) return res.data;
  throw new Error(res.error || "Failed to deploy Google Script");
}
