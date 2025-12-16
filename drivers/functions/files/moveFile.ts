import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, FileMetadata } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";
import { client } from "../../jirenClient";

export async function moveFile(
  oauth2: OAuth2Client,
  fileId: string,
  newFolderId: string
): Promise<ApiResponse<FileMetadata>> {
  try {
    const authHeader = await oauth2.getAuthHeader();

    // Step 1: Get current parents
    const getResponse = client.get(
      `${DRIVE_API_BASE}/files/${fileId}?fields=parents`,
      { headers: authHeader }
    );

    if (!getResponse.ok) {
      const error = await getResponse.text();
      throw new Error(error);
    }

    const fileData = getResponse.json();
    const previousParents = fileData.parents ? fileData.parents.join(",") : "";

    // Step 2: Move the file by adding new parent and removing old ones
    const queryParams = new URLSearchParams({
      addParents: newFolderId,
      removeParents: previousParents,
      fields: "id, parents, name",
    });

    const updateResponse = client.patch(
      `${DRIVE_API_BASE}/files/${fileId}?${queryParams.toString()}`,
      "",
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(error);
    }

    const data = updateResponse.json();
    return { success: true, data: data as FileMetadata };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
