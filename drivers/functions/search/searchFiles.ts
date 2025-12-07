import { OAuth2Client } from "../../oauth2-client";
import { ApiResponse, ListFilesResponse } from "../../../types";
import { listFiles } from "../files/listFiles";

export async function searchFiles(
  oauth2: OAuth2Client,
  searchQuery: string,
  pageSize: number = 10
): Promise<ApiResponse<ListFilesResponse>> {
  return listFiles(oauth2, {
    query: searchQuery,
    pageSize: pageSize,
  });
}
