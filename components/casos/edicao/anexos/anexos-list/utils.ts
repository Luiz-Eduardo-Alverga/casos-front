import {
  FileText,
  Film,
  ImageIcon,
  Paperclip,
  type LucideIcon,
} from "lucide-react";

import type { CaseAttachmentListItem } from "@/services/db-api/case-attachments";

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Fluxo típico: só em cliente (“use client”). Blob + revoke após uso. */
export async function downloadAttachment(
  url: string,
  filename: string,
): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

export function isImageRow(row: CaseAttachmentListItem): boolean {
  return row.kind === "image" || row.mimeType.startsWith("image/");
}

export function pickRowIcon(row: CaseAttachmentListItem): LucideIcon {
  if (isImageRow(row)) return ImageIcon;
  if (row.kind === "pdf" || row.mimeType === "application/pdf") return FileText;
  if (row.kind === "video" || row.mimeType.startsWith("video/")) return Film;
  return Paperclip;
}
