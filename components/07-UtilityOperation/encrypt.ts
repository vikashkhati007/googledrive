import { driveService } from "../../drivers/services";

/**
 * Encrypts plain text using AES-256-GCM with password-based key derivation.
 */
export function encryptText(plainText: string, password: string, salt: string) {
  return driveService.encryptText(plainText, password, salt);
}

/**
 * Decrypts encrypted text using AES-256-GCM with password-based key derivation.
 */
export function decryptText(
  encryptedText: string,
  password: string,
  salt: string
) {
  return driveService.decryptText(encryptedText, password, salt);
}
