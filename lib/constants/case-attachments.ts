/** Bucket privado no Supabase Storage (criar no dashboard se ainda não existir). */
export const CASE_ATTACHMENTS_BUCKET = "casos-anexos";

export const MAX_ATTACHMENTS_PER_CASE = 10;

/** TTL (segundos) das URLs assinadas de upload e download. */
export const SIGNED_UPLOAD_TTL_SEC = 300;
export const SIGNED_DOWNLOAD_TTL_SEC = 300;

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

export const ALLOWED_ATTACHMENT_MIMES = [
  ...IMAGE_MIMES,
  ...PDF_MIMES,
  ...VIDEO_MIMES,
] as const;

export type AllowedAttachmentMime = (typeof ALLOWED_ATTACHMENT_MIMES)[number];

/** Limites por tipo (bytes). */
export const MAX_BYTES_IMAGE = 10 * 1024 * 1024;
export const MAX_BYTES_PDF = 25 * 1024 * 1024;
export const MAX_BYTES_VIDEO = 100 * 1024 * 1024;

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
]);
