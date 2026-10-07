import {
  CASE_ATTACHMENTS_BUCKET,
  MULTIPART_PART_SIZE_BYTES,
  MULTIPART_THRESHOLD_BYTES,
  SIGNED_DOWNLOAD_TTL_SEC,
  SIGNED_UPLOAD_TTL_SEC,
} from "@/lib/constants/case-attachments";
import {
  abortMultipartUploadSession,
  completeMultipartUploadSession,
  createMultipartUploadSession,
  createSignedGetUrl,
  createSignedPutUrl,
  deleteStoredObject,
  headStoredObject,
} from "@/lib/storage/s3";

export type SignedUploadResult = {
  path: string;
  uploadUrl: string;
  token: string;
};

export type MultipartUploadPart = {
  partNumber: number;
  uploadUrl: string;
};

export type MultipartUploadSession = {
  path: string;
  uploadId: string;
  partSize: number;
  parts: MultipartUploadPart[];
};

export function attachmentUsesMultipart(sizeBytes: number): boolean {
  return sizeBytes > MULTIPART_THRESHOLD_BYTES;
}

export function multipartPartCount(sizeBytes: number): number {
  return Math.ceil(sizeBytes / MULTIPART_PART_SIZE_BYTES);
}

/**
 * Gera URL assinada para o cliente fazer `PUT` do arquivo direto no S3.
 * O `Content-Type` entra na assinatura e precisa ser repetido no PUT.
 */
export async function createCaseAttachmentSignedUpload(
  objectPath: string,
  contentType: string,
): Promise<SignedUploadResult> {
  const uploadUrl = await createSignedPutUrl({
    bucket: CASE_ATTACHMENTS_BUCKET,
    key: objectPath,
    contentType,
    expiresIn: SIGNED_UPLOAD_TTL_SEC,
  });

  return {
    path: objectPath,
    uploadUrl,
    token: "",
  };
}

export async function createCaseAttachmentMultipartUpload(input: {
  objectPath: string;
  contentType: string;
  sizeBytes: number;
}): Promise<MultipartUploadSession> {
  const session = await createMultipartUploadSession({
    bucket: CASE_ATTACHMENTS_BUCKET,
    key: input.objectPath,
    contentType: input.contentType,
    partCount: multipartPartCount(input.sizeBytes),
    partSize: MULTIPART_PART_SIZE_BYTES,
    expiresIn: SIGNED_UPLOAD_TTL_SEC,
  });

  return {
    path: input.objectPath,
    uploadId: session.uploadId,
    partSize: session.partSize,
    parts: session.parts,
  };
}

export async function completeCaseAttachmentMultipartUpload(input: {
  objectPath: string;
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
}): Promise<void> {
  await completeMultipartUploadSession({
    bucket: CASE_ATTACHMENTS_BUCKET,
    key: input.objectPath,
    uploadId: input.uploadId,
    parts: input.parts,
  });
}

export async function abortCaseAttachmentMultipartUpload(
  objectPath: string,
  uploadId: string,
): Promise<void> {
  await abortMultipartUploadSession({
    bucket: CASE_ATTACHMENTS_BUCKET,
    key: objectPath,
    uploadId,
  });
}

export async function createCaseAttachmentSignedDownloadUrl(
  objectPath: string,
  expiresInSec = SIGNED_DOWNLOAD_TTL_SEC,
): Promise<string> {
  return createSignedGetUrl({
    bucket: CASE_ATTACHMENTS_BUCKET,
    key: objectPath,
    expiresIn: expiresInSec,
  });
}

export async function getCaseAttachmentObjectInfo(
  objectPath: string,
): Promise<{ size: number; mimeType: string | null } | null> {
  return headStoredObject(CASE_ATTACHMENTS_BUCKET, objectPath);
}

export async function removeCaseAttachmentObject(
  objectPath: string,
): Promise<void> {
  await deleteStoredObject(CASE_ATTACHMENTS_BUCKET, objectPath);
}
