import { JirenClient } from "jiren";

export const client = new JirenClient();

// Prefetch connections to warm up DNS and TLS handshakes
// This makes subsequent requests much faster
// IMPORTANT: Must use full URLs with paths, not just domains
// client.prefetch([
//   "https://oauth2.googleapis.com/token", // OAuth token endpoint
//   "https://www.googleapis.com/drive/v3/files", // Drive API files endpoint
//   "https://www.googleapis.com/drive/v3/about", // Drive API about/quota
//   "https://www.googleapis.com/upload/drive/v3/files", // Drive upload endpoint
//   "https://script.googleapis.com/v1/projects", // Apps Script projects
//   "https://accounts.google.com/o/oauth2/auth", // OAuth auth flow
// ]);
