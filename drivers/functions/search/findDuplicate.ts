import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE } from "../../../const";

export async function findDuplicate(oauth2: OAuth2Client): Promise<void> {
  try {
    console.log("\n🔍 Scanning Google Drive for duplicate names...");

    const files: any[] = [];
    let pageToken: string | undefined = undefined;
    const authHeader = await oauth2.getAuthHeader();

    do {
      const queryParams = new URLSearchParams({
        q: "trashed=false",
        fields: "nextPageToken,files(id,name,mimeType,parents)",
        pageSize: "1000",
      });

      if (pageToken) {
        queryParams.set("pageToken", pageToken);
      }

      const response = await fetch(
        `${DRIVE_API_BASE}/files?${queryParams.toString()}`,
        { headers: authHeader }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const res = await response.json();
      files.push(...(res.files || []));
      pageToken = res.nextPageToken || undefined;
    } while (pageToken);

    console.log(`\n📁 Total items scanned: ${files.length}`);

    const nameMap: Record<string, any[]> = {};
    for (const f of files) {
      const name = f.name || "Untitled";
      if (!nameMap[name]) nameMap[name] = [];
      nameMap[name].push(f);
    }

    const duplicateFiles = Object.entries(nameMap)
      .filter(([_, arr]) => arr.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (duplicateFiles.length === 0) {
      console.log("\n✅ No duplicate names found! Drive looks clean.\n");
      return;
    }

    console.log(`\n⚠️ Found ${duplicateFiles.length} duplicate names:\n`);

    for (const [name, items] of duplicateFiles) {
      const type =
        items[0].mimeType === "application/vnd.google-apps.folder"
          ? "📁 Folder"
          : "📄 File";

      console.log(`${type} ${name} → (${items.length} duplicates)\n`);

      items.forEach((f, i) => {
        const id = f.id;
        const parent = f.parents?.[0]
          ? `Parent: ${f.parents[0]}`
          : "Parent: None";
        console.log(`   #${i + 1}  ID: ${id}  |  ${parent}`);
      });

      console.log("──────────────────────────────────────────────\n");
    }

    console.log("✨ Done! Duplicate analysis complete.\n");
  } catch (err: any) {
    console.error("❌ Error finding duplicates:", err.message || err);
  }
}
