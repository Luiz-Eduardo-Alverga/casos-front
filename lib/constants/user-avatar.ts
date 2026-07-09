/** Bucket privado no Supabase Storage (criar no dashboard se ainda não existir). */
export const USER_AVATAR_BUCKET = "user-avatars";

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
