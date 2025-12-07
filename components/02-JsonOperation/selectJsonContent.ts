import { driveService } from "../../drivers/services";

/**
 * Select full JSON data from Google Drive file.
 * @param fileId - Google Drive file ID of the JSON file.
 * @returns Full JSON object.
 */
export async function selectJsonContent(fileId: string): Promise<any> {
  const data = await driveService.selectJsonContent(fileId);
  return {
    success: true,
    data,
  };
}
