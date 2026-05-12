"use client";

import { Download, Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CaseAttachmentListItem } from "@/services/db-api/case-attachments";
import { cn } from "@/lib/utils";

import type { AttachmentPreviewState } from "./types";
import { formatBytes, isImageRow, pickRowIcon } from "./utils";

export interface AttachmentListRowProps {
  row: CaseAttachmentListItem;
  canDelete: boolean;
  onPreview: (state: AttachmentPreviewState) => void;
  onDownload: (
    e: React.MouseEvent | undefined,
    row: CaseAttachmentListItem,
  ) => void;
  onDeleteClick: () => void;
}

export function AttachmentListRow({
  row,
  canDelete,
  onPreview,
  onDownload,
  onDeleteClick,
}: AttachmentListRowProps) {
  const Icon = pickRowIcon(row);
  const image = isImageRow(row);

  return (
    <li
      className={cn(
        "group flex flex-row items-center gap-3 rounded-xl border border-border-divider bg-card px-4 py-3 shadow-sm outline-none",
        "transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      tabIndex={0}
    >
      <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border-divider bg-muted">
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.downloadUrl}
                alt={row.filenameOriginal}
                className="size-full object-cover"
                loading="lazy"
              />
            </>
          ) : (
            <div className="flex size-full items-center justify-center">
              <Icon className="size-7 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-blue-50 dark:bg-blue-950/40">
          <Icon className="size-3.5 text-blue-700 dark:text-blue-300" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-5 text-text-primary">
            {row.filenameOriginal}
          </p>
          <p className="mt-0.5 text-xs leading-4 text-text-secondary">
            {formatBytes(row.sizeBytes)} • {row.mimeType}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "ml-auto flex shrink-0 items-center gap-1 transition-opacity sm:gap-2",
          "opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100",
          "group-focus-within:pointer-events-auto group-focus-within:opacity-100",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-text-primary"
          aria-label={`Baixar ${row.filenameOriginal}`}
          onClick={(e) => onDownload(e, row)}
        >
          <Download className="size-4" />
        </Button>
        {image && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-text-primary"
            aria-label={`Visualizar ${row.filenameOriginal}`}
            onClick={(e) => {
              e.stopPropagation();
              onPreview({
                url: row.downloadUrl,
                name: row.filenameOriginal,
              });
            }}
          >
            <Eye className="size-4" />
          </Button>
        )}
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label={`Excluir ${row.filenameOriginal}`}
            onClick={onDeleteClick}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </li>
  );
}
