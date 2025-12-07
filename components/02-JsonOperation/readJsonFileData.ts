import { readFileData } from "../01-FileOperation/readFileData";

/**
 * Read JSON file content from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function readJsonFileData(fileId: string): Promise<any> {
  const content = await readFileData(fileId);
  try {
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return { success: false, error: "Failed to parse JSON file content" };
  }
}
