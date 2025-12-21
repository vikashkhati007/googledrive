import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE, MIME_LABELS, MIME_TYPES } from "../../../const";
import { client } from "../../Client";

export async function getFileTypeBreakdown(
  oauth2: OAuth2Client,
  parentId: string = "root"
): Promise<Record<string, number>> {
  const results: any[] = [];
  let pageToken: string | undefined = undefined;
  const authHeader = await oauth2.getAuthHeader();

  for (let i = 0; i < 20; i++) {
    const queryParams = new URLSearchParams({
      q: `'${parentId}' in parents and trashed = false`,
      fields: "nextPageToken,files(mimeType)",
      pageSize: "1000",
    });

    if (pageToken) {
      queryParams.set("pageToken", pageToken);
    }

    const response = await client.get(
      `${DRIVE_API_BASE}/files?${queryParams.toString()}`,
      { headers: authHeader }
    );

    if (!response.ok) break;

    const res = await response.json();
    results.push(res);

    if (!res.nextPageToken) break;
    pageToken = res.nextPageToken;
  }

  const typeCounts: Record<string, number> = {};
  results.forEach((res) => {
    for (const file of res.files || []) {
      const mime = file.mimeType || "unknown";
      typeCounts[mime] = (typeCounts[mime] || 0) + 1;
    }
  });

  const friendlyCounts: Record<string, number> = {};
  Object.entries(typeCounts).forEach(([mime, count]) => {
    const label = MIME_LABELS[mime] || mime;
    friendlyCounts[label] = (friendlyCounts[label] || 0) + count;
  });

  return friendlyCounts;
}
