import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      "Configuração ausente: defina S3_ENDPOINT, S3_ACCESS_KEY e S3_SECRET_KEY para anexos.",
    );
  }
  return value;
}

/**
 * Cliente S3 da Softcom — apenas em Route Handlers / server.
 * Credenciais nunca vão para o browser.
 */
export function getS3Client(): S3Client {
  if (client) return client;

  const endpoint = requiredEnv("S3_ENDPOINT");
  const accessKeyId = requiredEnv("S3_ACCESS_KEY");
  const secretAccessKey = requiredEnv("S3_SECRET_KEY");
  const region = process.env.S3_REGION?.trim() || "us-east-1";

  client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

export async function createSignedPutUrl(input: {
  bucket: string;
  key: string;
  contentType: string;
  expiresIn: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
    ContentType: input.contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: input.expiresIn });
}

export async function createSignedGetUrl(input: {
  bucket: string;
  key: string;
  expiresIn: number;
}): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: input.expiresIn });
}

function isMissingObject(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const metadata =
    "$metadata" in error && error.$metadata && typeof error.$metadata === "object"
      ? (error.$metadata as { httpStatusCode?: number })
      : undefined;
  return (
    name === "NotFound" ||
    name === "NoSuchKey" ||
    metadata?.httpStatusCode === 404
  );
}

function releaseBody(body: unknown) {
  if (!body || typeof body !== "object") return;
  if ("destroy" in body && typeof body.destroy === "function") {
    body.destroy();
    return;
  }
  if ("cancel" in body && typeof body.cancel === "function") {
    void body.cancel();
  }
}

/**
 * O HEAD nesse MinIO, atrás da Cloudflare, volta 403 sem corpo XML.
 * O SDK lê isso como UnknownError. O GET traz tamanho e tipo nos
 * headers; o corpo é descartado em seguida.
 */
export async function headStoredObject(
  bucket: string,
  key: string,
): Promise<{ size: number; mimeType: string | null } | null> {
  try {
    const output = await getS3Client().send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    releaseBody(output.Body);
    const raw = output.ContentType?.split(";")[0]?.trim() || null;
    return {
      size: typeof output.ContentLength === "number" ? output.ContentLength : 0,
      mimeType: raw,
    };
  } catch (error) {
    if (isMissingObject(error)) return null;
    throw error;
  }
}

export async function deleteStoredObject(
  bucket: string,
  key: string,
): Promise<void> {
  try {
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao remover arquivo do storage";
    throw new Error(message);
  }
}

export async function createMultipartUploadSession(input: {
  bucket: string;
  key: string;
  contentType: string;
  partCount: number;
  partSize: number;
  expiresIn: number;
}): Promise<{
  uploadId: string;
  partSize: number;
  parts: { partNumber: number; uploadUrl: string }[];
}> {
  const created = await getS3Client().send(
    new CreateMultipartUploadCommand({
      Bucket: input.bucket,
      Key: input.key,
      ContentType: input.contentType,
    }),
  );
  const uploadId = created.UploadId;
  if (!uploadId) {
    throw new Error("Resposta de upload multipart inválida (sem UploadId)");
  }

  const parts: { partNumber: number; uploadUrl: string }[] = [];
  for (let partNumber = 1; partNumber <= input.partCount; partNumber += 1) {
    const command = new UploadPartCommand({
      Bucket: input.bucket,
      Key: input.key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });
    const uploadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: input.expiresIn,
    });
    parts.push({ partNumber, uploadUrl });
  }

  return { uploadId, partSize: input.partSize, parts };
}

export function normalizePartEtag(etag: string): string {
  const trimmed = etag.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed;
  return `"${trimmed}"`;
}

export async function completeMultipartUploadSession(input: {
  bucket: string;
  key: string;
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
}): Promise<void> {
  const parts = [...input.parts].sort((a, b) => a.partNumber - b.partNumber);
  await getS3Client().send(
    new CompleteMultipartUploadCommand({
      Bucket: input.bucket,
      Key: input.key,
      UploadId: input.uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          PartNumber: part.partNumber,
          ETag: normalizePartEtag(part.etag),
        })),
      },
    }),
  );
}

export async function abortMultipartUploadSession(input: {
  bucket: string;
  key: string;
  uploadId: string;
}): Promise<void> {
  await getS3Client().send(
    new AbortMultipartUploadCommand({
      Bucket: input.bucket,
      Key: input.key,
      UploadId: input.uploadId,
    }),
  );
}
