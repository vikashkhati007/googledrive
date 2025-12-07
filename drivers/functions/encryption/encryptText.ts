import { ApiResponse } from "../../../types";
import * as crypto from "crypto";
import { Buffer } from "buffer";

export async function encryptText(
  plainText: string,
  password: string,
  salt: string
): Promise<ApiResponse<string>> {
  try {
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, authTag, encrypted]);
    const base64Output = combined.toString("base64");

    return { success: true, data: base64Output };
  } catch (err: any) {
    console.error("❌ Encryption failed:", err.message);
    return { success: false, error: err.message || "Encryption failed" };
  }
}
