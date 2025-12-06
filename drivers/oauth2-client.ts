import * as fs from "fs";
import type { TokenData, GoogleCredentials } from "../types/index";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/**
 * Lightweight OAuth2 client using Bun's native fetch
 * Handles token storage, refresh, and authorization headers
 */
export class OAuth2Client {
  private accessToken: string = "";
  private refreshToken: string = "";
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private expiryDate: number = 0;
  private tokensPath: string;
  private onTokensRefresh?: (tokens: TokenData) => void;

  constructor(
    credentials: GoogleCredentials,
    tokensPath: string = "./tokens.json"
  ) {
    const creds = credentials.web || credentials.installed || credentials;
    this.clientId = creds.client_id!;
    this.clientSecret = creds.client_secret!;
    this.redirectUri =
      "redirect_uris" in creds
        ? creds.redirect_uris[0]
        : (credentials as any).redirect_uri || "";
    this.tokensPath = tokensPath;
  }

  /**
   * Set tokens and optionally enable auto-save on refresh
   */
  public setCredentials(tokens: TokenData): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token || "";
    this.expiryDate = tokens.expiry_date || 0;
  }

  /**
   * Set callback for when tokens are refreshed
   */
  public onTokensRefreshed(callback: (tokens: TokenData) => void): void {
    this.onTokensRefresh = callback;
  }

  /**
   * Get a valid access token, refreshing if expired
   */
  public async getAccessToken(): Promise<string> {
    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    const isExpired =
      this.expiryDate > 0 && now >= this.expiryDate - 5 * 60 * 1000;

    if (isExpired && this.refreshToken) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  /**
   * Refresh the access token using the refresh token
   */
  public async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = await response.json();

    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
    this.expiryDate = Date.now() + (data.expires_in || 3600) * 1000;

    const tokens: TokenData = {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expiry_date: this.expiryDate,
      token_type: data.token_type || "Bearer",
      scope: data.scope,
    };

    // Save tokens to file
    fs.writeFileSync(this.tokensPath, JSON.stringify(tokens, null, 2));
    console.log("🔄 Tokens refreshed and saved");

    // Notify callback if set
    if (this.onTokensRefresh) {
      this.onTokensRefresh(tokens);
    }
  }

  /**
   * Get authorization header for API requests
   */
  public async getAuthHeader(): Promise<{ Authorization: string }> {
    const token = await this.getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Exchange authorization code for tokens
   */
  public async getToken(code: string): Promise<TokenData> {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const data = await response.json();

    const tokens: TokenData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
      token_type: data.token_type || "Bearer",
      scope: data.scope,
    };

    this.setCredentials(tokens);
    return tokens;
  }

  /**
   * Generate OAuth2 authorization URL
   */
  public generateAuthUrl(options: {
    access_type?: string;
    prompt?: string;
    scope: string[];
    include_granted_scopes?: boolean;
  }): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: options.scope.join(" "),
      access_type: options.access_type || "offline",
    });

    if (options.prompt) {
      params.set("prompt", options.prompt);
    }

    if (options.include_granted_scopes !== undefined) {
      params.set(
        "include_granted_scopes",
        String(options.include_granted_scopes)
      );
    }

    return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
  }
}
