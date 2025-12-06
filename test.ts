// import { generateCredentialsAndTokens } from "./auth";
// await generateCredentialsAndTokens({
//   clientid: process.env.GOOGLE_CLIENT_ID!,
//   projectid: process.env.GOOGLE_PROJECT_ID!,
//   clientsecret: process.env.GOOGLE_CLIENT_SECRET!,
//   redirecturis: ["http://localhost:3000/oauth2callback"],
//   javascript_origin: ["http://localhost:3000"],
// });

import { initDriveService } from "./drivers/services";
import * as operations from "./operations";
async function main() {
  initDriveService();
  const folderId = await operations.createFolder("Test Folder");
  console.log(folderId);
}

main();
