import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE } from "../../../const";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";

export async function createStreamfilesandFolder(
  oauth2: OAuth2Client,
  fileId: string
): Promise<NodeJS.ReadableStream | null> {
  try {
    const authHeader = await oauth2.getAuthHeader();
    const metaResponse = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType`,
      { headers: authHeader }
    );

    if (!metaResponse.ok) {
      throw new Error(await metaResponse.text());
    }

    const meta = await metaResponse.json();
    const mimeType = meta.mimeType;

    const exportMap: Record<string, string> = {
      "application/vnd.google-apps.document":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.google-apps.spreadsheet":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.google-apps.presentation":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.google-apps.drawing": "image/png",
    };

    let response: Response;

    if (exportMap[mimeType!]) {
      console.log(`📤 Exporting ${meta.name} (${mimeType})`);
      response = await fetch(
        `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(
          exportMap[mimeType!]
        )}`,
        { headers: authHeader }
      );
    } else {
      response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
        headers: authHeader,
      });
    }

    if (!response.ok) {
      throw new Error(await response.text());
    }

    if (response.body) {
      return Readable.fromWeb(response.body as ReadableStream<any>);
    }

    return null;
  } catch (err: any) {
    console.warn(`⚠️ Failed to stream file ${fileId}:`, err.message);
    return null;
  }
}
