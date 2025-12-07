import { driveService } from "../../drivers/services";

/**
 * Update or rename a key in a JSON file stored on Google Drive.
 * Supports nested keys using dot notation (e.g., "user.profile.name").
 */
export async function updateJsonFieldAndValues(
  fileId: string,
  keyPath: string,
  newKey?: string,
  newValue?: any
) {
  try {
    const readResponse = await driveService.readFileData(fileId, true);
    if (!readResponse.success || !readResponse.data) {
      throw new Error(readResponse.error || "Failed to read JSON file data");
    }

    let jsonData: Record<string, any>;
    try {
      jsonData = JSON.parse(readResponse.data as string);
    } catch {
      throw new Error("Invalid JSON format in file");
    }

    const parts = keyPath.split(".");
    let current = jsonData;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        throw new Error(`Key path '${keyPath}' does not exist in JSON`);
      }
      current = current[part];
    }

    const oldKey = parts.at(-1)!;

    if (!(oldKey in current)) {
      throw new Error(`Key '${oldKey}' does not exist`);
    }

    const existingValue = current[oldKey];
    const finalValue = newValue !== undefined ? newValue : existingValue;
    const finalKey = newKey && newKey !== oldKey ? newKey : oldKey;

    const rebuilt: Record<string, any> = {};
    for (const k of Object.keys(current)) {
      if (k === oldKey) {
        rebuilt[finalKey] = finalValue;
      } else {
        rebuilt[k] = current[k];
      }
    }

    Object.keys(current).forEach((k) => delete current[k]);
    Object.assign(current, rebuilt);

    const updateResponse = await driveService.updateJsonContent(
      fileId,
      jsonData
    );
    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Failed to update file");
    }

    return { success: true, data: updateResponse.data };
  } catch (error: any) {
    console.error("❌ Error updating JSON key-value:", error.message);
    return { success: false, error: error.message };
  }
}
