import { OAuth2Client } from "../oauth2-client";
import { client, type HttpResponse } from "../Client";

/**
 * Helper method to make authenticated requests using native fetch
 */
export async function fetchWithAuth(
  oauthClient: OAuth2Client,
  url: string,
  options: RequestInit = {}
): Promise<HttpResponse> {
  const authHeader = await oauthClient.getAuthHeader();
  const headers: Record<string, string> = {
    ...authHeader,
  };

  // Merge additional headers
  if (options.headers) {
    const optHeaders = options.headers as Record<string, string>;
    Object.assign(headers, optHeaders);
  }

  const method = (options.method || "GET").toUpperCase();

  // Handle different HTTP methods with native fetch wrapper
  let response: HttpResponse;
  if (method === "GET") {
    response = await client.get(url, { headers });
  } else if (method === "POST") {
    response = await client.post(url, (options.body as string) || "", {
      headers,
    });
  } else if (method === "PATCH") {
    response = await client.patch(url, (options.body as string) || "", {
      headers,
    });
  } else if (method === "DELETE") {
    response = await client.delete(url, { headers });
  } else {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  return response;
}
