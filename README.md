## 🧩 gdrivekit

> **Google Drive file automation in just a few lines of code.**
> Perform uploads, downloads, folder management, and advanced search operations effortlessly using TypeScript or Node.js.

---

### 🚀 Features

- 📂 Upload, download, and manage Google Drive files
- 🗂️ Create and organize folders
- 🔍 Powerful search and filter utilities
- ⚙️ Batch file operations
- ⚡ **Lazy Loading Architecture:** Functions are loaded only when needed.
- 💡 Works with Node.js and Bun

---

### 📦 Installation

```bash
npm install gdrivekit
```

or

```bash
bun add gdrivekit
```

---

### 💻 Example Usage

### ⚙️ One-Time Setup (Token Generation)

Before you can use Google Drive operations, you must generate **access and refresh tokens**.
This only needs to be done **once**.

```ts
import { generateCredentialsAndTokens } from "gdrivekit";

await generateCredentialsAndTokens({
  clientid: process.env.GOOGLE_CLIENT_ID!,
  projectid: process.env.GOOGLE_PROJECT_ID!,
  clientsecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirecturis: ["http://localhost:3000/oauth2callback"],
  javascript_origin: ["http://localhost:3000"],
});
```

---

# 🔄 Initializing the Drive Service

Initialize the service and access operations through categorized groups:

```ts
import { initDriveService, operations } from "gdrivekit";

async function main() {
  initDriveService();

  // Example: Search files by name using searchOperations
  const files = await operations.searchOperations.searchByName("test");
  console.log(files.data?.files);

  // Example: Get Folder ID by Name using folderOperations
  const folder = await operations.folderOperations.getFolderIdByName(
    "My Documents"
  );
  console.log(folder);

  // Example: List all folders using listOperations
  const allFolders = await operations.listOperations.listAllFolders();
  console.log(allFolders);
}

main();
```

---

## 🧠 Available Operations

All operations are grouped by category under the main `operations` object.

### 📁 **`operations.fileOperations`**

| Method                  | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `readFileData()`        | Read file content                               |
| `uploadFile()`          | Upload a new file to Google Drive               |
| `downloadFile()`        | Download a file from Drive                      |
| `deleteFile()`          | Permanently delete a file                       |
| `renameFile()`          | Rename an existing file                         |
| `updateFile()`          | Update file metadata or content                 |
| `getFileInfo()`         | Get details of a specific file                  |
| `getFileIdByName()`     | Fetch file ID by its name (Exact Match)         |
| `getCompleteFileInfo()` | Get complete file metadata including all fields |
| `moveFile()`            | Move file to another folder using file ID       |
| `copyFile()`            | Make a copy of a file in Drive                  |
| `getImageMetadata()`    | Get image metadata (EXIF data, dimensions)      |
| `getVideoMetadata()`    | Get video metadata (duration, dimensions)       |

---

### 🗂️ **`operations.folderOperations`**

| Method                | Description                               |
| --------------------- | ----------------------------------------- |
| `createFolder()`      | Create a new folder                       |
| `deleteFolder()`      | Delete an existing folder                 |
| `renameFolder()`      | Rename an existing folder                 |
| `getFolderIdByName()` | Fetch folder ID by its name (Exact Match) |

---

### 🔍 **`operations.searchOperations`**

| Method                  | Description                            |
| ----------------------- | -------------------------------------- |
| `searchByName()`        | Search files containing a name         |
| `searchByExactName()`   | Search files matching exact name       |
| `searchByType()`        | Search by file type (e.g., PDF, image) |
| `searchModifiedAfter()` | Find files modified after a given date |
| `searchStarredFiles()`  | List all starred files                 |
| `searchSharedFiles()`   | Find files shared with you             |
| `searchByContent()`     | Search within file content             |

---

### 📋 **`operations.listOperations`**

| Method                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `listFiles()`           | List all files in Drive                   |
| `listRecentFiles()`     | List recently modified or added files     |
| `listFoldersByName()`   | List all folders with a specific name     |
| `listAllFolders()`      | List all folders in Drive                 |
| `listFilesInFolder()`   | List all files within a specific folder   |
| `listFoldersInFolder()` | List all folders within a specific folder |
| `listPDFs()`            | List all PDF files                        |
| `listImages()`          | List all image files                      |
| `listVideos()`          | List all video files                      |
| `listAudios()`          | List all audio files                      |
| `listArchives()`        | List all archive files                    |
| `listJSONs()`           | List all json files                       |
| `listSheets()`          | List all sheet files                      |
| `listPresentations()`   | List all presentation files               |
| `listDocs()`            | List all docs files                       |

---

### 🧩 **`operations.batchOperations`**

| Method                    | Description                          |
| ------------------------- | ------------------------------------ |
| `uploadMultipleFiles()`   | Upload multiple files at once        |
| `deleteMultipleFiles()`   | Delete multiple files simultaneously |
| `downloadMultipleFiles()` | Download multiple files in parallel  |

---

### 🧰 **`operations.utilityOperations`**

| Method                           | Description                                               |
| -------------------------------- | --------------------------------------------------------- |
| `encryptText()`                  | Encrypt plain text using AES-256-GCM                      |
| `decryptText()`                  | Decrypt encrypted text using AES-256-GCM                  |
| `filesAndFoldersToZip()`         | Create a zip archive of folder and multiple files         |
| `findDuplicateFilesAndFolders()` | Find duplicate file and folder names in Drive             |
| `getFileTypeBreakdown()`         | Get folder type breakdown in a parent folder              |
| `getAllFilesInParent()`          | Get all files in a parent folder not including subfolders |
| `shareFile()`                    | Share a file with a user                                  |
| `fileExists()`                   | Check if a file exists                                    |
| `getStorageQuota()`              | Get storage quota information                             |
| `createStream()`                 | Create stream for any Google Drive file                   |

---

### ❴❵ **`operations.jsonOperations`**

| Method                       | Description                             |
| ---------------------------- | --------------------------------------- |
| `createJsonFile()`           | Create a new JSON file                  |
| `readJsonFileData()`         | Read JSON file content                  |
| `addJsonKeyValue()`          | Add a new key-value pair to a JSON file |
| `pushJsonObjectToArray()`    | Push a new object to a JSON array field |
| `updateJsonFieldAndValues()` | Update an existing field in a JSON file |
| `selectJsonContent()`        | Select content from a JSON file         |
| `deleteJsonFieldAndKeys()`   | Delete a field from a JSON file         |

---

### ⚞ **`operations.conversionOperations`**

| Method                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `convertTextToDocs()`   | Convert a text file to Google Docs format  |
| `convertDocsToPdf()`    | Convert a Google Docs file to PDF          |
| `convertDocsToWord()`   | Convert a Google Docs file to Word         |
| `convertDocsToText()`   | Convert a Google Docs file to plain text   |
| `convertCsvToSheet()`   | Convert a CSV file to Google Sheets        |
| `convertExcelToSheet()` | Convert an Excel file to Google Sheets     |
| `convertSheetToCsv()`   | Convert a Google Sheet to CSV              |
| `convertSheetToPdf()`   | Convert a Google Sheet to PDF              |
| `convertPptToSlides()`  | Convert a PowerPoint file to Google Slides |
| `convertSlidesToPpt()`  | Convert a Google Slides file to PowerPoint |
| `convertSlidesToPdf()`  | Convert a Google Slides file to PDF        |
| `convertPdfToDocs()`    | Convert a PDF file to Google Docs (OCR)    |
| `convertDrawingToPng()` | Convert a Google Drawing to PNG            |
| `convertDrawingToPdf()` | Convert a Google Drawing to PDF            |

---

### ⚞ **`operations.watcherOperations`**

| Method                   | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `watchFolderEvent()`     | Detect add/modify/delete events in a folder (non-recursive). |
| `watchFolderDeepEvent()` | Detect events recursively in a folder and subfolders.        |

---

### ⚞ **`operations.scriptOperations`**

| Method                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `createGoogleScript()` | Create a new Google Apps Script project.        |
| `updateGoogleScript()` | Update code in an existing Apps Script project. |
| `deleteGoogleScript()` | Move an Apps Script project to trash.           |
| `deployGoogleScript()` | Deploy a new version of an Apps Script project. |

## 🔑 Enabling Google Apps Script API (Required for Script Tools)

### 1️⃣ Enable Apps Script API in Google Cloud Console

Open this link (replace YOUR_PROJECT_ID if needed):

👉 https://console.cloud.google.com/apis/library/script.googleapis.com?project=YOUR_PROJECT_ID

Then:

1. Click **Enable**
2. Make sure the Apps Script API is active in your Cloud project

### 2️⃣ Enable Apps Script API in Your Google Account

Apps Script also requires user-level permission.

Open:

👉 https://script.google.com/home/usersettings

Then turn **ON**:

🔘 “Apps Script API”

This MUST be enabled or script creation, updating, and deployment will fail.

---

### 🧑‍💻 Author

**Vikash Khati**
[GitHub](https://github.com/vikashkhati007) • [NPM](https://www.npmjs.com/~vikashkhati007)

---

### ⚖️ License

**MIT License** — free to use, modify, and distribute.

---
