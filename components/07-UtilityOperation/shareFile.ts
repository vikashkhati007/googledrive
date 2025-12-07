import { driveService } from "../../drivers/services";

/**
 * Share File
 */
export function shareFile(
  fileId: string,
  emailAddress: string,
  role: string = "reader"
) {
  return driveService.shareFile(fileId, emailAddress, role);
}
