function readServerEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

/** Bucket privado no S3 da Softcom (`S3_BUCKET_ANEXOS`). */
export const CASE_ATTACHMENTS_BUCKET = readServerEnv(
  "S3_BUCKET_ANEXOS",
  "softflow-prod-anexos",
);

export const MAX_ATTACHMENTS_PER_CASE = 10;
export const MAX_ATTACHMENTS_PER_DOC = 10;

/** TTL (segundos) das URLs assinadas de upload e download. */
export const SIGNED_UPLOAD_TTL_SEC = 300;
export const SIGNED_DOWNLOAD_TTL_SEC = 300;

/** Acima deste tamanho o upload de anexo usa multipart (limite do túnel Cloudflare). */
export const MULTIPART_THRESHOLD_BYTES = 64 * 1024 * 1024;
export const MULTIPART_PART_SIZE_BYTES = 64 * 1024 * 1024;

export const IMAGE_MIMES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const PDF_MIMES = ["application/pdf"] as const;

export const VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const XML_MIMES = ["application/xml", "text/xml"] as const;

export const ARCHIVE_MIMES = ["application/vnd.rar"] as const;

export const ALLOWED_ATTACHMENT_MIMES = [
  ...IMAGE_MIMES,
  ...PDF_MIMES,
  ...VIDEO_MIMES,
  ...XML_MIMES,
  ...ARCHIVE_MIMES,
] as const;

export type AllowedAttachmentMime = (typeof ALLOWED_ATTACHMENT_MIMES)[number];

/** Limites por tipo (bytes). */
export const MAX_BYTES_IMAGE = 10 * 1024 * 1024;
export const MAX_BYTES_PDF = 25 * 1024 * 1024;
export const MAX_BYTES_VIDEO = 100 * 1024 * 1024;
export const MAX_BYTES_XML = 25 * 1024 * 1024;
export const MAX_BYTES_ARCHIVE = 100 * 1024 * 1024;

/** Com o teto de vídeo, um multipart tem no máximo este número de partes. */
export const MAX_MULTIPART_PARTS = Math.ceil(
  MAX_BYTES_VIDEO / MULTIPART_PART_SIZE_BYTES,
);

export const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "pdf",
  "mp4",
  "webm",
  "mov",
  "xml",
  "rar",
]);

/** Valor do atributo `accept` nos seletores de anexo. */
export const ATTACHMENT_FILE_ACCEPT =
  ".png,.jpg,.jpeg,.webp,.gif,.pdf,.mp4,.webm,.mov,.xml,.rar,image/*,application/pdf,video/*,application/xml,text/xml,application/vnd.rar";
