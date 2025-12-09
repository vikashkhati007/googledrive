import { driveService } from "../../drivers/services";

/**
 * Run a Google Script function
 */
export async function runGoogleScript(
  scriptId: string,
  functionName: string,
  parameters?: any[],
  devMode?: boolean
) {
  const res = await driveService.runScript(
    scriptId,
    functionName,
    parameters,
    devMode
  );
  if (res.success) return res.data;
  throw new Error(res.error || "Failed to run script");
}
