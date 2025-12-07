import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types";
import { readFileData } from "../files/readFileData";
import { updateJsonContent } from "./updateJsonContent";

export async function addJsonContent(
  oauth2: OAuth2Client,
  fileId: string,
  key: string,
  value: any
): Promise<ApiResponse<FileMetadata>> {
  try {
    // Step 1: Read existing JSON content
    const fileData = await readFileData(oauth2, fileId, true);
    if (!fileData.success) {
      throw new Error(fileData.error || "Failed to read JSON file data");
    }

    // Step 2: Parse the JSON
    let jsonData: Record<string, any>;
    try {
      jsonData = JSON.parse(fileData.data as string);
    } catch {
      throw new Error("Invalid JSON format in file");
    }

    // Step 3: Add or overwrite key
    jsonData[key] = value;

    // Step 4: Upload updated JSON content
    return await updateJsonContent(oauth2, fileId, jsonData);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
