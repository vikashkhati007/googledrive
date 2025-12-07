import { OAuth2Client } from "../../oauth2-client";
import { FileMetadata } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";

export async function watchFolder(
  oauth2: OAuth2Client,
  folderId: string,
  intervalMs: number = 4000,
  callback: (event: {
    type: "added" | "modified" | "deleted";
    file: FileMetadata;
  }) => void
) {
  console.log(`👀 Watching folder: ${folderId}`);

  let previousState: Record<string, FileMetadata> = {};

  const fetchFiles = async () => {
    const authHeader = await oauth2.getAuthHeader();
    const response = await fetch(
      `${DRIVE_API_BASE}/files?q='${folderId}' in parents and trashed = false&fields=files(id,name,mimeType,modifiedTime,size)&pageSize=1000`,
      { headers: authHeader }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const res = await response.json();
    const map: Record<string, FileMetadata> = {};

    for (const f of res.files || []) {
      map[f.id!] = f as FileMetadata;
    }

    return map;
  };

  previousState = await fetchFiles();

  setInterval(async () => {
    try {
      const newState = await fetchFiles();

      for (const id of Object.keys(newState)) {
        if (!previousState[id]) {
          callback({ type: "added", file: newState[id] });
        }
      }

      for (const id of Object.keys(newState)) {
        const oldFile = previousState[id];
        const newFile = newState[id];
        if (!oldFile) continue;

        if (newFile.modifiedTime !== oldFile.modifiedTime) {
          callback({ type: "modified", file: newFile });
        }
      }

      for (const id of Object.keys(previousState)) {
        if (!newState[id]) {
          callback({ type: "deleted", file: previousState[id] });
        }
      }

      previousState = newState;
    } catch (err: any) {
      console.log("⚠️ Watcher error:", err.message);
    }
  }, intervalMs);
}
