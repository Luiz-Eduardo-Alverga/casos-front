import { FileText, Film, ImageIcon, Paperclip } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MAX_ATTACHMENTS_PER_DOC } from "@/lib/constants/case-attachments";
import { validateCaseAttachmentFile } from "@/services/db-api/case-attachments";

export function fileIcon(file: File): LucideIcon {
  const t = file.type || "";
  if (t.startsWith("image/")) return ImageIcon;
  if (t === "application/pdf") return FileText;
  if (t.startsWith("video/")) return Film;
  return Paperclip;
}

export function addFilesToDocList(
  current: File[],
  incoming: File[],
): { next: File[]; error?: string } {
  const next = [...current];
  for (const file of incoming) {
    if (next.length >= MAX_ATTACHMENTS_PER_DOC) {
      return {
        next,
        error: `No máximo ${MAX_ATTACHMENTS_PER_DOC} anexos por documento.`,
      };
    }
    const err = validateCaseAttachmentFile(file);
    if (err) {
      return { next, error: `${file.name}: ${err}` };
    }
    next.push(file);
  }
  return { next };
}
