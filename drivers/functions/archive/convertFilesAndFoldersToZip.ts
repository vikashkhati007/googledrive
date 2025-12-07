import { OAuth2Client } from "../../oauth2-client";
import { DRIVE_API_BASE, DRIVE_UPLOAD_BASE } from "../../../const";
import { createStreamfilesandFolder } from "../files/createStreamfilesandFolder";
import archiver from "archiver";
import archiverZipEncrypted from "archiver-zip-encrypted";
import { PassThrough, Readable } from "stream";
import { ReadableStream } from "stream/web";
import { Buffer } from "buffer";

(archiver as any).registerFormat("zip-encrypted", archiverZipEncrypted);

export async function convertFilesAndFoldersToZip(
  oauth2: OAuth2Client,
  options: {
    folderId?: string;
    fileIds?: string[];
    zipName: string;
    uploadToFolderId?: string;
    password?: string;
  }
): Promise<{
  success: boolean;
  data?: { id: string; name: string; webViewLink: string };
  error?: string;
}> {
  console.log("🟢 Starting convertFilesAndFoldersToZip...");
  const {
    folderId,
    fileIds = [],
    zipName,
    uploadToFolderId,
    password,
  } = options;

  try {
    const authHeader = await oauth2.getAuthHeader();

    if (folderId && fileIds.length > 0) {
      throw new Error(
        "⚠️ You can select either a folder OR multiple files, not both."
      );
    }
    if (!folderId && fileIds.length === 0) {
      throw new Error("⚠️ Please select a folder or files to zip.");
    }

    // Step 1: Determine parent folder
    let parentFolderId = uploadToFolderId;
    if (!parentFolderId) {
      const referenceId = folderId || fileIds[0];
      const response = await fetch(
        `${DRIVE_API_BASE}/files/${referenceId}?fields=parents`,
        { headers: authHeader }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const info = await response.json();
      const parents = info.parents;
      if (!parents || parents.length === 0) {
        throw new Error("⚠️ Could not determine parent folder.");
      }
      parentFolderId = parents[0];
    }

    // Step 2: Create streaming ZIP + PassThrough
    const archive = archiver((password ? "zip-encrypted" : "zip") as any, {
      zlib: { level: 9 },
      encryptionMethod: password ? "aes256" : undefined,
      password,
    });

    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    // Collect all chunks for upload
    const chunks: Buffer[] = [];
    passThrough.on("data", (chunk) => chunks.push(chunk));

    // Step 3: Add files/folders to archive
    const addFolderToArchive = async (id: string, currentPath = "") => {
      const response = await fetch(
        `${DRIVE_API_BASE}/files?q='${id}' in parents and trashed=false&fields=files(id,name,mimeType)`,
        { headers: authHeader }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const res = await response.json();
      const files = res.files || [];

      for (const file of files) {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          await addFolderToArchive(file.id!, `${currentPath}${file.name}/`);
        } else {
          const stream = await createStreamfilesandFolder(oauth2, file.id!);
          if (!stream) continue;

          const nodeStream =
            stream instanceof Readable
              ? stream
              : Readable.fromWeb(stream as any);

          archive.append(nodeStream, { name: `${currentPath}${file.name}` });
          console.log(`📦 Added: ${currentPath}${file.name}`);
        }
      }
    };

    if (folderId) {
      console.log("📁 Zipping folder...");
      await addFolderToArchive(folderId);
    } else {
      console.log("📄 Zipping multiple files...");
      for (const fileId of fileIds) {
        const metaResponse = await fetch(
          `${DRIVE_API_BASE}/files/${fileId}?fields=id,name`,
          { headers: authHeader }
        );

        if (!metaResponse.ok) continue;

        const meta = await metaResponse.json();
        const name = meta.name || `file_${fileId}`;
        const stream = await createStreamfilesandFolder(oauth2, fileId);
        if (!stream) continue;

        const nodeStream =
          stream instanceof Readable ? stream : Readable.fromWeb(stream as any);

        archive.append(nodeStream, { name });
        console.log(`📦 Added file: ${name}`);
      }
    }

    // Step 4: Finalize archive
    await archive.finalize();

    // Wait for all chunks
    await new Promise<void>((resolve) => passThrough.on("end", resolve));
    const zipBuffer = Buffer.concat(chunks);

    // Step 5: Upload the ZIP file
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileMetadata = {
      name: zipName.endsWith(".zip") ? zipName : `${zipName}.zip`,
      parents: [parentFolderId],
    };

    const metadataPart =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(fileMetadata);

    const mediaPart = delimiter + "Content-Type: application/zip\r\n\r\n";

    const body = Buffer.concat([
      Buffer.from(metadataPart),
      Buffer.from(mediaPart),
      zipBuffer,
      Buffer.from(closeDelimiter),
    ]);

    const uploadResponse = await fetch(
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(await uploadResponse.text());
    }

    const uploadRes = await uploadResponse.json();

    console.log(
      `✅ Uploaded ZIP: ${uploadRes.webViewLink} ${
        password ? "(🔐 password protected)" : ""
      }`
    );

    return {
      success: true,
      data: {
        id: uploadRes.id!,
        name: uploadRes.name!,
        webViewLink: uploadRes.webViewLink!,
      },
    };
  } catch (err: any) {
    console.error("❌ convertFilesAndFoldersToZip failed:", err.message);
    return {
      success: false,
      error: err.message || "Unknown error",
    };
  }
}
