import {
  SIGNED_AVATAR_DOWNLOAD_TTL_SEC,
  SIGNED_AVATAR_UPLOAD_TTL_SEC,
  USER_AVATAR_BUCKET,
} from "@/lib/constants/user-avatar";
import {
  createSignedGetUrl,
  createSignedPutUrl,
  deleteStoredObject,
  headStoredObject,
} from "@/lib/storage/s3";
import type { SignedUploadResult } from "@/lib/storage/case-attachments";

export type { SignedUploadResult };

export async function createUserAvatarSignedUpload(
  objectPath: string,
  contentType: string,
): Promise<SignedUploadResult> {
  const uploadUrl = await createSignedPutUrl({
    bucket: USER_AVATAR_BUCKET,
    key: objectPath,
    contentType,
    expiresIn: SIGNED_AVATAR_UPLOAD_TTL_SEC,
  });

  return {
    path: objectPath,
    uploadUrl,
    token: "",
  };
}

export async function createUserAvatarSignedDownloadUrl(
  objectPath: string,
  expiresInSec = SIGNED_AVATAR_DOWNLOAD_TTL_SEC,
): Promise<string> {
  return createSignedGetUrl({
    bucket: USER_AVATAR_BUCKET,
    key: objectPath,
    expiresIn: expiresInSec,
  });
}

export async function getUserAvatarObjectInfo(
  objectPath: string,
): Promise<{ size: number; mimeType: string | null } | null> {
  return headStoredObject(USER_AVATAR_BUCKET, objectPath);
}

export async function removeUserAvatarObject(objectPath: string): Promise<void> {
  await deleteStoredObject(USER_AVATAR_BUCKET, objectPath);
}
