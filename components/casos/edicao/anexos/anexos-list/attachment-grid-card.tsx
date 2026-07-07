"use client";

import { Download, Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CaseAttachmentListItem } from "@/services/db-api/case-attachments";
import { cn } from "@/lib/utils";

import type { AttachmentPreviewState } from "./types";
import { formatBytes, isImageRow, pickRowIcon } from "./utils";

export interface AttachmentGridCardProps {
  row: CaseAttachmentListItem;
  canDelete: boolean;
  onPreview: (state: AttachmentPreviewState) => void;
  onDownload: (
    e: React.MouseEvent | undefined,
    row: CaseAttachmentListItem,
  ) => void;
  onDeleteClick: () => void;
}

export function AttachmentGridCard({
  row,
  canDelete,
  onPreview,
  onDownload,
  onDeleteClick,
}: AttachmentGridCardProps) {
  const Icon = pickRowIcon(row);
  const image = isImageRow(row);

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border-divider bg-card shadow-sm">
      <div className="relative isolate h-32 shrink-0 border-b border-border-divider bg-muted">
        {image ? (
          <div
            className="group relative isolate h-full w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            tabIndex={0}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.downloadUrl}
              alt={row.filenameOriginal}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              className={cn(
                "absolute inset-0 z-[1] flex items-center justify-center gap-3 bg-slate-900/40 opacity-0 backdrop-blur-[2px] transition-opacity",
                "pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100",
                "group-focus-within:pointer-events-auto group-focus-within:opacity-100",
              )}
            >
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-8 rounded-full border-0 bg-card shadow-sm hover:bg-card"
                aria-label={`Visualizar ${row.filenameOriginal}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview({
                    url: row.downloadUrl,
                    name: row.filenameOriginal,
                  });
                }}
              >
                <Eye className="size-4 text-text-primary" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-8 rounded-full border-0 bg-card shadow-sm hover:bg-card"
                aria-label={`Baixar ${row.filenameOriginal}`}
                onClick={(e) => onDownload(e, row)}
              >
                <Download className="size-4 text-text-primary" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center gap-3 px-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted-foreground/20">
              <Icon className="size-8 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-wrap items-start justify-between gap-2 p-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded bg-blue-50 dark:bg-blue-950/40">
            <Icon className="size-3.5 text-blue-700 dark:text-blue-300" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-5 text-text-primary">
              {row.filenameOriginal}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs leading-4 text-text-secondary">
              <span>{formatBytes(row.sizeBytes)}</span>
              <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
              <span>{row.mimeType}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {!image && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Baixar ${row.filenameOriginal}`}
              onClick={(e) => onDownload(e, row)}
            >
              <Download className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label={`Excluir ${row.filenameOriginal}`}
              onClick={onDeleteClick}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
