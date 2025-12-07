import { driveService } from "../../drivers/services";

/**
 * Delete a key (supports nested paths like "user.profile.name")
 * from a JSON file stored in Google Drive.
 */
export async function deleteJsonFieldAndKeys(fileId: string, key: string) {
  try {
    const readResponse = await driveService.readFileData(fileId, true);
    if (!readResponse.success || !readResponse.data) {
      throw new Error(readResponse.error || "Failed to read JSON file data");
    }

    let jsonData: any;
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
        throw new Error(`Key path '${key}' does not exist in JSON`);
      }
      current = current[part];
    }

    const lastKey = parts.at(-1)!;

    if (Array.isArray(current)) {
      const index = parseInt(lastKey, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        throw new Error(`Invalid array index: ${lastKey}`);
      }
      current.splice(index, 1);
    } else {
      if (!(lastKey in current)) {
        throw new Error(`Key '${lastKey}' does not exist`);
      }
      delete current[lastKey];
    }

    const updateResponse = await driveService.updateJsonContent(
      fileId,
      jsonData
    );
    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Failed to update file");
    }

    return { success: true, data: updateResponse.data };
  } catch (error: any) {
    console.error("❌ Error deleting key-value pair:", error.message);
    return { success: false, error: error.message };
  }
}
