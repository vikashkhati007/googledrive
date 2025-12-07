import { OAuth2Client } from "../../oauth2-client";
import { createStream } from "../files/createStream";
import { MIME_TYPES } from "../../../const";

export async function selectJsonContent(
  oauth2: OAuth2Client,
  fileId: string
): Promise<any> {
  try {
    const fileStream = await createStream(oauth2, fileId, MIME_TYPES.JSON);
    if (!fileStream) {
      throw new Error("Failed to create stream for JSON file");
    }

    let jsonContent = "";
    for await (const chunk of fileStream) {
      jsonContent += chunk.toString();
    }

    const jsonData = JSON.parse(jsonContent);
    return jsonData;
  } catch (error: any) {
    console.error("❌ JSON selection failed:", error.message);
    return null;
  }
}
