import { ApiResponse } from "../../../types";
import * as crypto from "crypto";
import { Buffer } from "buffer";

export async function decryptText(
  encryptedBase64: string,
  password: string,
  salt: string
): Promise<ApiResponse<string>> {
  try {
    const key = crypto.scryptSync(password, salt, 32);
    const data = Buffer.from(encryptedBase64, "base64");

    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const ciphertext = data.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return { success: true, data: decrypted.toString("utf8") };
  } catch (err: any) {
    console.error("❌ Decryption failed:", err.message);
    return { success: false, error: err.message || "Decryption failed" };
  }
}
