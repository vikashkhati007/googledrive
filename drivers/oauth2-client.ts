import * as fs from "fs";
import type { TokenData, GoogleCredentials } from "../types/index";
import { client } from "./Client";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export interface OAuth2ClientOptions {
  /** Path to tokens file (default: ./tokens.json) */
  tokensPath?: string;
  /** Whether to auto-save tokens to file (default: true) */
  autoSaveToFile?: boolean;
  /** Callback when tokens are refreshed - use this for custom persistence */
  onTokensRefresh?: (tokens: TokenData) => void;
}

/**
 * Lightweight OAuth2 client using Bun's native fetch
 * Handles token storage, refresh, and authorization headers
 *
 * Token refresh happens automatically when:
 * - A token is within 5 minutes of expiry
 * - An API call is made via getAccessToken() or getAuthHeader()
 */
export class OAuth2Client {
  get(
    url: string,
    arg1: {
      headers:
        | {
            length: number;
            toString(): string;
            toLocaleString(): string;
            toLocaleString(
              locales: string | string[],
              options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions
            ): string;
            pop(): [string, string] | undefined;
            push(...items: [string, string][]): number;
            concat(
              ...items: ConcatArray<[string, string]>[]
            ): [string, string][];
            concat(
              ...items: ([string, string] | ConcatArray<[string, string]>)[]
            ): [string, string][];
            join(separator?: string): string;
            reverse(): [string, string][];
            shift(): [string, string] | undefined;
            slice(start?: number, end?: number): [string, string][];
            sort(
              compareFn?:
                | ((a: [string, string], b: [string, string]) => number)
                | undefined
            ): [string, string][];
            splice(start: number, deleteCount?: number): [string, string][];
            splice(
              start: number,
              deleteCount: number,
              ...items: [string, string][]
            ): [string, string][];
            unshift(...items: [string, string][]): number;
            indexOf(
              searchElement: [string, string],
              fromIndex?: number
            ): number;
            lastIndexOf(
              searchElement: [string, string],
              fromIndex?: number
            ): number;
            every<S extends [string, string]>(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => value is S,
              thisArg?: any
            ): this is S[];
            every(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => unknown,
              thisArg?: any
            ): boolean;
            some(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => unknown,
              thisArg?: any
            ): boolean;
            forEach(
              callbackfn: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => void,
              thisArg?: any
            ): void;
            map<U>(
              callbackfn: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => U,
              thisArg?: any
            ): U[];
            filter<S extends [string, string]>(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => value is S,
              thisArg?: any
            ): S[];
            filter(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => unknown,
              thisArg?: any
            ): [string, string][];
            reduce(
              callbackfn: (
                previousValue: [string, string],
                currentValue: [string, string],
                currentIndex: number,
                array: [string, string][]
              ) => [string, string]
            ): [string, string];
            reduce(
              callbackfn: (
                previousValue: [string, string],
                currentValue: [string, string],
                currentIndex: number,
                array: [string, string][]
              ) => [string, string],
              initialValue: [string, string]
            ): [string, string];
            reduce<U>(
              callbackfn: (
                previousValue: U,
                currentValue: [string, string],
                currentIndex: number,
                array: [string, string][]
              ) => U,
              initialValue: U
            ): U;
            reduceRight(
              callbackfn: (
                previousValue: [string, string],
                currentValue: [string, string],
                currentIndex: number,
                array: [string, string][]
              ) => [string, string]
            ): [string, string];
            reduceRight(
              callbackfn: (
                previousValue: [string, string],
                currentValue: [string, string],
                currentIndex: number,
                array: [string, string][]
              ) => [string, string],
              initialValue: [string, string]
            ): [string, string];
            reduceRight<U>(
              callbackfn: (
                previousValue: U,
                currentValue: [string, string],
                currentIndex: number,
                array: [string, string][]
              ) => U,
              initialValue: U
            ): U;
            find<S extends [string, string]>(
              predicate: (
                value: [string, string],
                index: number,
                obj: [string, string][]
              ) => value is S,
              thisArg?: any
            ): S | undefined;
            find(
              predicate: (
                value: [string, string],
                index: number,
                obj: [string, string][]
              ) => unknown,
              thisArg?: any
            ): [string, string] | undefined;
            findIndex(
              predicate: (
                value: [string, string],
                index: number,
                obj: [string, string][]
              ) => unknown,
              thisArg?: any
            ): number;
            fill(
              value: [string, string],
              start?: number,
              end?: number
            ): [string, string][];
            copyWithin(
              target: number,
              start: number,
              end?: number
            ): [string, string][];
            entries(): ArrayIterator<[number, [string, string]]>;
            keys(): ArrayIterator<number>;
            values(): ArrayIterator<[string, string]>;
            includes(
              searchElement: [string, string],
              fromIndex?: number
            ): boolean;
            flatMap<U, This = undefined>(
              callback: (
                this: This,
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => U | readonly U[],
              thisArg?: This | undefined
            ): U[];
            flat<A, D extends number = 1>(
              this: A,
              depth?: D | undefined
            ): FlatArray<A, D>[];
            at(index: number): [string, string] | undefined;
            findLast<S extends [string, string]>(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => value is S,
              thisArg?: any
            ): S | undefined;
            findLast(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => unknown,
              thisArg?: any
            ): [string, string] | undefined;
            findLastIndex(
              predicate: (
                value: [string, string],
                index: number,
                array: [string, string][]
              ) => unknown,
              thisArg?: any
            ): number;
            toReversed(): [string, string][];
            toSorted(
              compareFn?:
                | ((a: [string, string], b: [string, string]) => number)
                | undefined
            ): [string, string][];
            toSpliced(
              start: number,
              deleteCount: number,
              ...items: [string, string][]
            ): [string, string][];
            toSpliced(start: number, deleteCount?: number): [string, string][];
            with(index: number, value: [string, string]): [string, string][];
            [Symbol.iterator](): ArrayIterator<[string, string]>;
            [Symbol.unscopables]: {
              [x: number]: boolean | undefined;
              length?: boolean | undefined;
              toString?: boolean | undefined;
              toLocaleString?: boolean | undefined;
              pop?: boolean | undefined;
              push?: boolean | undefined;
              concat?: boolean | undefined;
              join?: boolean | undefined;
              reverse?: boolean | undefined;
              shift?: boolean | undefined;
              slice?: boolean | undefined;
              sort?: boolean | undefined;
              splice?: boolean | undefined;
              unshift?: boolean | undefined;
              indexOf?: boolean | undefined;
              lastIndexOf?: boolean | undefined;
              every?: boolean | undefined;
              some?: boolean | undefined;
              forEach?: boolean | undefined;
              map?: boolean | undefined;
              filter?: boolean | undefined;
              reduce?: boolean | undefined;
              reduceRight?: boolean | undefined;
              find?: boolean | undefined;
              findIndex?: boolean | undefined;
              fill?: boolean | undefined;
              copyWithin?: boolean | undefined;
              entries?: boolean | undefined;
              keys?: boolean | undefined;
              values?: boolean | undefined;
              includes?: boolean | undefined;
              flatMap?: boolean | undefined;
              flat?: boolean | undefined;
              at?: boolean | undefined;
              findLast?: boolean | undefined;
              findLastIndex?: boolean | undefined;
              toReversed?: boolean | undefined;
              toSorted?: boolean | undefined;
              toSpliced?: boolean | undefined;
              with?: boolean | undefined;
              [Symbol.iterator]?: boolean | undefined;
              readonly [Symbol.unscopables]?: boolean | undefined;
            };
            Authorization: string;
          }
        | { Authorization: string }
        | {
            append(name: string, value: string): void;
            delete(name: string): void;
            get(name: string): string | null;
            getSetCookie(): string[];
            has(name: string): boolean;
            set(name: string, value: string): void;
            forEach(
              callbackfn: (value: string, key: string, parent: Headers) => void,
              thisArg?: any
            ): void;
            entries(): HeadersIterator<[string, string]>;
            keys(): HeadersIterator<string>;
            values(): HeadersIterator<string>;
            [Symbol.iterator](): HeadersIterator<[string, string]>;
            Authorization: string;
          };
      body?: BodyInit | null;
      cache?: RequestCache;
      credentials?: RequestCredentials;
      integrity?: string;
      keepalive?: boolean;
      method?: string;
      mode?: RequestMode;
      priority?: RequestPriority;
      redirect?: RequestRedirect;
      referrer?: string;
      referrerPolicy?: ReferrerPolicy;
      signal?: AbortSignal | null;
      window?: null;
    }
  ) {
    throw new Error("Method not implemented.");
  }
  private accessToken: string = "";
  private refreshToken: string = "";
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private expiryDate: number = 0;
  private tokensPath: string;
  private autoSaveToFile: boolean;
  private onTokensRefresh?: (tokens: TokenData) => void;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(
    credentials: GoogleCredentials,
    options: OAuth2ClientOptions | string = {}
  ) {
    // Support legacy string parameter for tokensPath
    const opts: OAuth2ClientOptions =
      typeof options === "string" ? { tokensPath: options } : options;

    const creds = credentials.web || credentials.installed || credentials;
    this.clientId = creds.client_id!;
    this.clientSecret = creds.client_secret!;
    this.redirectUri =
      "redirect_uris" in creds
        ? creds.redirect_uris[0]
        : (credentials as any).redirect_uri || "";
    this.tokensPath = opts.tokensPath || "./tokens.json";
    this.autoSaveToFile = opts.autoSaveToFile !== false; // Default true
    this.onTokensRefresh = opts.onTokensRefresh;
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
   * Automatically refreshes the token if it's within 5 minutes of expiry
   */
  public async getAccessToken(): Promise<string> {
    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    const isExpired =
      this.expiryDate > 0 && now >= this.expiryDate - 5 * 60 * 1000;

    if (isExpired && this.refreshToken) {
      // Prevent concurrent refresh requests
      if (this.isRefreshing && this.refreshPromise) {
        await this.refreshPromise;
      } else {
        this.isRefreshing = true;
        this.refreshPromise = this.refreshAccessToken().finally(() => {
          this.isRefreshing = false;
          this.refreshPromise = null;
        });
        await this.refreshPromise;
      }
    }

    return this.accessToken;
  }

  /**
   * Check if the current token is expired or about to expire
   */
  public isTokenExpired(bufferMinutes: number = 5): boolean {
    const now = Date.now();
    return (
      this.expiryDate > 0 && now >= this.expiryDate - bufferMinutes * 60 * 1000
    );
  }

  /**
   * Get current tokens (useful for persistence)
   */
  public getTokens(): TokenData {
    return {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expiry_date: this.expiryDate,
      token_type: "Bearer",
      scope: "",
    };
  }

  /**
   * Refresh the access token using the refresh token
   */
  public async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: "refresh_token",
    }).toString();

    const response = await client.post(TOKEN_ENDPOINT, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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
      scope: data.scope || "",
    };

    // Save tokens to file if auto-save is enabled
    if (this.autoSaveToFile) {
      try {
        fs.writeFileSync(this.tokensPath, JSON.stringify(tokens, null, 2));
        console.log("🔄 Tokens refreshed and saved to file");
      } catch (error) {
        // File write might fail in serverless environments - that's OK if callback is set
        console.warn(
          "⚠️ Could not save tokens to file:",
          error instanceof Error ? error.message : error
        );
      }
    }

    // Always notify callback if set - this is the primary way to persist in SSR/serverless
    if (this.onTokensRefresh) {
      try {
        this.onTokensRefresh(tokens);
        console.log("🔄 Tokens refreshed and callback notified");
      } catch (error) {
        console.error("❌ Error in onTokensRefresh callback:", error);
      }
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
    const body = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: "authorization_code",
    }).toString();

    const response = await client.post(TOKEN_ENDPOINT, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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
