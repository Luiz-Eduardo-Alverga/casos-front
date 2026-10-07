function readServerEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

/** Bucket privado no S3 da Softcom (`S3_BUCKET_AVATARS`). */
export const USER_AVATAR_BUCKET = readServerEnv(
  "S3_BUCKET_AVATARS",
  "softflow-prod-avatars",
);

export const MAX_BYTES_AVATAR = 2 * 1024 * 1024;

export const ALLOWED_AVATAR_MIMES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const ALLOWED_AVATAR_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

/** TTL (segundos) das URLs assinadas de upload e download. */
export const SIGNED_AVATAR_UPLOAD_TTL_SEC = 300;
export const SIGNED_AVATAR_DOWNLOAD_TTL_SEC = 300;
