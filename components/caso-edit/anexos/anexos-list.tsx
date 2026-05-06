"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Film,
  ImageIcon,
  Paperclip,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import type { CaseAttachmentListItem } from "@/services/db-api/case-attachments";
import { cn } from "@/lib/utils";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageRow(row: CaseAttachmentListItem): boolean {
  return row.kind === "image" || row.mimeType.startsWith("image/");
}

function pickRowIcon(row: CaseAttachmentListItem) {
  if (isImageRow(row)) return ImageIcon;
  if (row.kind === "pdf" || row.mimeType === "application/pdf")
    return FileText;
  if (row.kind === "video" || row.mimeType.startsWith("video/")) return Film;
  return Paperclip;
}

export interface AnexosListProps {
  items: CaseAttachmentListItem[];
  isLoading?: boolean;
  canDelete?: boolean;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export function AnexosList({
  items,
  isLoading = false,
  canDelete = false,
  onDelete,
  isDeleting = false,
}: AnexosListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <p className="text-sm text-text-secondary py-4">Carregando anexos…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-4">
        Nenhum anexo neste caso ainda.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {items.map((row) => {
          const Icon = pickRowIcon(row);
          const showThumb = isImageRow(row);

          return (
            <li
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-border-divider p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {showThumb ? (
                  <a
                    href={row.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 overflow-hidden rounded-md border border-border-divider bg-muted"
                    title="Abrir imagem"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.downloadUrl}
                      alt={row.filenameOriginal}
                      className="h-20 w-20 object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border-divider bg-muted">
                    <Icon className="h-6 w-6 text-text-secondary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {row.filenameOriginal}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatBytes(row.sizeBytes)} · {row.mimeType}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:pl-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={row.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={row.filenameOriginal}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Baixar
                  </a>
                </Button>
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("text-destructive hover:text-destructive")}
                    aria-label={`Excluir ${row.filenameOriginal}`}
                    onClick={() => setDeleteId(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmacaoModal
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        titulo="Excluir anexo"
        descricao="Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!deleteId) return;
          await onDelete(deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
}
