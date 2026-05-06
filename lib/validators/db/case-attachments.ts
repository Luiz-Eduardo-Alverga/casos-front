import { z } from "zod";
import {
  ALLOWED_ATTACHMENT_MIMES,
  ALLOWED_EXTENSIONS,
  IMAGE_MIMES,
  MAX_ATTACHMENTS_PER_CASE,
  MAX_BYTES_IMAGE,
  MAX_BYTES_PDF,
  MAX_BYTES_VIDEO,
  PDF_MIMES,
  VIDEO_MIMES,
} from "@/lib/constants/case-attachments";

const mimeEnum = z.enum(ALLOWED_ATTACHMENT_MIMES);

function maxBytesForMime(mime: string): number {
  if ((IMAGE_MIMES as readonly string[]).includes(mime)) return MAX_BYTES_IMAGE;
  if ((PDF_MIMES as readonly string[]).includes(mime)) return MAX_BYTES_PDF;
  if ((VIDEO_MIMES as readonly string[]).includes(mime)) return MAX_BYTES_VIDEO;
  return 0;
}

function extensionFromFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const dot = base.lastIndexOf(".");
  if (dot < 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function assertExtensionMatchesMime(
  filename: string,
  mimeType: string,
): boolean {
  const ext = extensionFromFilename(filename);
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) return false;
  if (mimeType === "image/jpeg" && (ext === "jpg" || ext === "jpeg"))
    return true;
  if (mimeType === "video/quicktime" && ext === "mov") return true;
  if (mimeType === "image/png" && ext === "png") return true;
  if (mimeType === "image/webp" && ext === "webp") return true;
  if (mimeType === "image/gif" && ext === "gif") return true;
  if (mimeType === "application/pdf" && ext === "pdf") return true;
  if (mimeType === "video/mp4" && ext === "mp4") return true;
  if (mimeType === "video/webm" && ext === "webm") return true;
  return false;
}

const mimeSizeRefinement = (
  val: { mimeType: string; sizeBytes: number },
  ctx: z.RefinementCtx,
) => {
  const max = maxBytesForMime(val.mimeType);
  if (val.sizeBytes > max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tamanho máximo para este tipo é ${Math.round(max / (1024 * 1024))} MB`,
      path: ["sizeBytes"],
    });
  }
};

export const casoRegistroParamSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(2_147_483_647);

export const presignUploadBodySchema = z
  .object({
    filename: z.string().min(1).max(512),
    mimeType: mimeEnum,
    sizeBytes: z.coerce.number().int().positive(),
  })
  .superRefine(mimeSizeRefinement)
  .superRefine((val, ctx) => {
    if (!assertExtensionMatchesMime(val.filename, val.mimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Extensão do arquivo não corresponde ao tipo MIME informado",
        path: ["filename"],
      });
    }
  });

export type PresignUploadBody = z.infer<typeof presignUploadBodySchema>;

export const finalizeAttachmentBodySchema = z
  .object({
    path: z.string().min(1).max(1024),
    filenameOriginal: z.string().min(1).max(255),
    mimeType: mimeEnum,
    sizeBytes: z.coerce.number().int().positive(),
  })
  .superRefine(mimeSizeRefinement)
  .superRefine((val, ctx) => {
    if (!assertExtensionMatchesMime(val.filenameOriginal, val.mimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Extensão do arquivo não corresponde ao tipo MIME informado",
        path: ["filenameOriginal"],
      });
    }
  });

export type FinalizeAttachmentBody = z.infer<typeof finalizeAttachmentBodySchema>;

export function validateStoragePathForRegistro(
  path: string,
  casoRegistro: number,
): boolean {
  const prefix = `casos/${casoRegistro}/`;
  if (!path.startsWith(prefix)) return false;
  const rest = path.slice(prefix.length);
  if (!rest || rest.includes("/") || rest.includes("..")) return false;
  const uuidPart = rest.split(".")[0];
  if (!uuidPart || rest.split(".").length < 2) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuidPart,
  );
}

export function classifyAttachmentKind(
  mime: string,
): "image" | "pdf" | "video" | "other" {
  if ((IMAGE_MIMES as readonly string[]).includes(mime)) return "image";
  if ((PDF_MIMES as readonly string[]).includes(mime)) return "pdf";
  if ((VIDEO_MIMES as readonly string[]).includes(mime)) return "video";
  return "other";
}

export { MAX_ATTACHMENTS_PER_CASE };
