import { OAuth2Client } from "../../oauth2-client";
import { FileMetadata } from "../../../types";
import { DRIVE_API_BASE } from "../../../const";
import { client } from "../../jirenClient";

export async function watchFolderDeep(
  oauth2: OAuth2Client,
  folderId: string,
  intervalMs: number = 4000,
  callback: (event: {
    type: "added" | "modified" | "deleted";
    file: FileMetadata;
  }) => void
) {
  console.log(`👁️ Watching folder recursively: ${folderId}`);

  let previousState: Record<string, FileMetadata> = {};

  const fetchAll = async (
    id: string
  ): Promise<Record<string, FileMetadata>> => {
    let map: Record<string, FileMetadata> = {};
    const authHeader = await oauth2.getAuthHeader();

    const response = client.get(
      `${DRIVE_API_BASE}/files?q='${id}' in parents and trashed = false&fields=files(id,name,mimeType,modifiedTime,parents)&pageSize=1000`,
      { headers: authHeader }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const res = response.json();
    const items = res.files || [];

    for (const item of items) {
      map[item.id!] = item as FileMetadata;

      if (item.mimeType === "application/vnd.google-apps.folder") {
        const childMap = await fetchAll(item.id!);
        map = { ...map, ...childMap };
      }
    }

    return map;
  };

  previousState = await fetchAll(folderId);

  setInterval(async () => {
    try {
      const newState = await fetchAll(folderId);

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
      console.log("⚠️ Recursive watcher error:", err.message);
    }
  }, intervalMs);
}
