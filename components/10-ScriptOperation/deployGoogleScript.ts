import { driveService } from "../../drivers/services";

/**
 * Deploy a Google Script as web app
 */
export async function deployGoogleScript(scriptId: string) {
  try {
    const res = await driveService.DeployScript(scriptId);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || "Failed to deploy script");
  } catch (err: any) {
    throw new Error("Auto Deploy Failed: " + (err.message || err));
  }
}
