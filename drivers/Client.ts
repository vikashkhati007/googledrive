/**
 * Native fetch wrapper - drop-in replacement for JirenClient
 * Uses Bun's optimized native fetch for best performance
 */

export interface HttpResponse extends Response {
  json<T = any>(): Promise<T>;
}

type RequestBody = string | FormData | Blob | ArrayBuffer | null;
type RequestHeaders = Record<string, string>;

async function request(
  url: string,
  method: string,
  body?: RequestBody,
  headers?: RequestHeaders
): Promise<HttpResponse> {
  return fetch(url, { method, headers, body }) as Promise<HttpResponse>;
}

export const client = {
  get: (url: string, opts?: { headers?: RequestHeaders }) =>
    request(url, "GET", null, opts?.headers),

  post: (
    url: string,
    body?: RequestBody,
    opts?: { headers?: RequestHeaders }
  ) => request(url, "POST", body, opts?.headers),

  patch: (
    url: string,
    body?: RequestBody,
    opts?: { headers?: RequestHeaders }
  ) => request(url, "PATCH", body, opts?.headers),

  delete: (url: string, opts?: { headers?: RequestHeaders }) =>
    request(url, "DELETE", null, opts?.headers),

  put: (url: string, body?: RequestBody, opts?: { headers?: RequestHeaders }) =>
    request(url, "PUT", body, opts?.headers),
};
