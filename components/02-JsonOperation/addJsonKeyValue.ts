import { driveService } from "../../drivers/services";

/**
 * Add a new key-value pair to a JSON file on Google Drive.
 * Supports nested keys (e.g., "user.profile.name").
 */
export async function addJsonKeyValue(fileId: string, key: string, value: any) {
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

    const parts = key.split(".");
    let current = jsonData;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts.at(-1)!] = value;

    const updateResponse = await driveService.updateJsonContent(
      fileId,
      jsonData
    );
    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Failed to update file");
    }

    return { success: true, data: updateResponse.data };
  } catch (error: any) {
    console.error("❌ Error adding key-value pair:", error.message);
    return { success: false, error: error.message };
  }
}
