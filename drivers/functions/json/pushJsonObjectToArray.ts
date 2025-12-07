import { OAuth2Client } from "../../oauth2-client";
import { createStream } from "../files/createStream";
import { updateFileContent } from "../files/updateFileContent";
import { MIME_TYPES } from "../../../const";

export async function pushJsonObjectToArray(
  oauth2: OAuth2Client,
  fileId: string,
  arrayPath: string,
  newObject: any
): Promise<any> {
  try {
    const fileStream = await createStream(oauth2, fileId, MIME_TYPES.JSON);
    if (!fileStream) throw new Error("Failed to create stream for JSON file");

    let jsonContent = "";
    for await (const chunk of fileStream) {
      jsonContent += chunk.toString();
    }

    const jsonData = JSON.parse(jsonContent);

    if (arrayPath.trim() === "") {
      if (Array.isArray(jsonData)) {
        jsonData.push(newObject);
      } else {
        throw new Error("Root JSON is not an array");
      }
    } else {
      const keys = arrayPath.split(".");
      let current = jsonData;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }

      const finalKey = keys[keys.length - 1];

      if (!Array.isArray(current[finalKey])) {
        current[finalKey] = current[finalKey] ? [current[finalKey]] : [];
      }

      current[finalKey].push(newObject);
    }

    const updatedFile = await updateFileContent(
      oauth2,
      fileId,
      JSON.stringify(jsonData, null, 2),
      MIME_TYPES.JSON
    );

    return {
      success: true,
      data: updatedFile,
    };
  } catch (error: any) {
    console.error("❌ Error pushing new object:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
