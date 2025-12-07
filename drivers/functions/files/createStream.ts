import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE } from "../../../const";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";

export async function createStream(
  oauth2: OAuth2Client,
  fileId: string,
  targetMimeType?: string
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

    const file = await metaResponse.json();
    const sourceMime = file.mimeType || "application/octet-stream";

    let response: Response;

    if (sourceMime.startsWith("application/vnd.google-apps.")) {
      if (!targetMimeType) {
        throw new Error(
          "Target MIME type required for Google native files (like Docs or Sheets)"
        );
      }

      response = await fetch(
        `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(
          targetMimeType
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

    // Convert web ReadableStream to Node.js ReadableStream
    if (response.body) {
      return Readable.fromWeb(response.body as ReadableStream<any>);
    }

    return null;
  } catch (error: any) {
    console.error("❌ Stream creation failed:", error.message);
    return null;
  }
}
