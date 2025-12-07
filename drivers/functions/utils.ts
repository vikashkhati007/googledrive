import { OAuth2Client } from "../oauth2-client";

/**
 * Helper method to make authenticated fetch requests
 */
export async function fetchWithAuth(
  client: OAuth2Client,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeader = await client.getAuthHeader();
  const headers = {
    ...authHeader,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  return response;
}
