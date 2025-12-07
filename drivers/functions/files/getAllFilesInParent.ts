import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE, MIME_TYPES } from "../../../const";

export async function getAllFilesInParent(
  oauth2: OAuth2Client,
  parentId: string
): Promise<Array<{ name: string; id: string; mimeType: string }>> {
  let pageToken: string | undefined = undefined;
  const results: Array<{ name: string; id: string; mimeType: string }> = [];
  const authHeader = await oauth2.getAuthHeader();

  for (let i = 0; i < 20; i++) {
    const queryParams = new URLSearchParams({
      q: `'${parentId}' in parents and trashed = false and mimeType != '${MIME_TYPES.FOLDER}'`,
      fields: "nextPageToken,files(name,id,mimeType)",
      pageSize: "1000",
    });

    if (pageToken) {
      queryParams.set("pageToken", pageToken);
    }

    const response = await fetch(
      `${DRIVE_API_BASE}/files?${queryParams.toString()}`,
      { headers: authHeader }
    );

    if (!response.ok) break;

    const res = await response.json();

    for (const file of res.files || []) {
      results.push({
        name: file.name,
        id: file.id,
        mimeType: file.mimeType,
      });
    }

    if (!res.nextPageToken) break;
    pageToken = res.nextPageToken;
  }

  return results;
}
