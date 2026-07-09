import { z } from "zod";
import {
  ALLOWED_AVATAR_EXTENSIONS,
  ALLOWED_AVATAR_MIMES,
  MAX_BYTES_AVATAR,
} from "@/lib/constants/user-avatar";

const mimeEnum = z.enum(ALLOWED_AVATAR_MIMES);

function extensionFromFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const dot = base.lastIndexOf(".");
  if (dot < 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function assertAvatarExtensionMatchesMime(
  filename: string,
  mimeType: string,
): boolean {
  const ext = extensionFromFilename(filename);
  if (!ext || !ALLOWED_AVATAR_EXTENSIONS.has(ext)) return false;
  if (mimeType === "image/jpeg" && (ext === "jpg" || ext === "jpeg"))
    return true;
  if (mimeType === "image/png" && ext === "png") return true;
  if (mimeType === "image/webp" && ext === "webp") return true;
  return false;
}

const mimeSizeRefinement = (
  val: { mimeType: string; sizeBytes: number },
  ctx: z.RefinementCtx,
) => {
  if (val.sizeBytes > MAX_BYTES_AVATAR) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tamanho máximo da foto é ${Math.round(MAX_BYTES_AVATAR / (1024 * 1024))} MB`,
      path: ["sizeBytes"],
    });
  }
};

export const presignAvatarBodySchema = z
  .object({
    filename: z.string().min(1).max(255),
    mimeType: mimeEnum,
    sizeBytes: z.coerce.number().int().positive(),
  })
  .superRefine(mimeSizeRefinement)
  .superRefine((val, ctx) => {
    if (!assertAvatarExtensionMatchesMime(val.filename, val.mimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Extensão do arquivo não corresponde ao tipo MIME informado",
        path: ["filename"],
      });
    }
  });

export const finalizeAvatarBodySchema = z
  .object({
    path: z.string().min(1).max(1024),
    filenameOriginal: z.string().min(1).max(255),
    mimeType: mimeEnum,
    sizeBytes: z.coerce.number().int().positive(),
  })
  .superRefine(mimeSizeRefinement)
  .superRefine((val, ctx) => {
    if (!assertAvatarExtensionMatchesMime(val.filenameOriginal, val.mimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Extensão do arquivo não corresponde ao tipo MIME informado",
        path: ["filenameOriginal"],
      });
    }
  });

export function validateAvatarStoragePathForUser(
  path: string,
  appUserId: string,
): boolean {
  const prefix = `users/${appUserId}/`;
  if (!path.startsWith(prefix)) return false;
  const rest = path.slice(prefix.length);
  if (!rest || rest.includes("/") || rest.includes("..")) return false;
  if (!rest.startsWith("avatar.")) return false;
  const ext = rest.slice("avatar.".length).toLowerCase();
  return ALLOWED_AVATAR_EXTENSIONS.has(ext);
}

export function buildUserAvatarObjectPath(
  appUserId: string,
  filename: string,
): string {
  const ext = extensionFromFilename(filename) || "webp";
  return `users/${appUserId}/avatar.${ext}`;
}
