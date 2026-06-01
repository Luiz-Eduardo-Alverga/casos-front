"use client";

import { useCallback, useState } from "react";
import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import type { CaseAttachmentListItem } from "@/services/db-api/case-attachments";
import { cn } from "@/lib/utils";

import { AttachmentGridCard } from "./attachment-grid-card";
import { AttachmentListRow } from "./attachment-list-row";
import { AttachmentPreviewDialog } from "./attachment-preview-dialog";
import type { AnexosListProps, AttachmentPreviewState, ViewMode } from "./types";
import { downloadAttachment } from "./utils";

export type { AnexosListProps } from "./types";

export function AnexosList({
  items,
  isLoading = false,
  canDelete = false,
  onDelete,
  isDeleting = false,
}: AnexosListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [preview, setPreview] = useState<AttachmentPreviewState | null>(null);

  const handleDownload = useCallback(
    (e: React.MouseEvent | undefined, row: CaseAttachmentListItem) => {
      e?.preventDefault();
      e?.stopPropagation();
      void downloadAttachment(row.downloadUrl, row.filenameOriginal);
    },
    [],
  );

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
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium leading-5 text-text-primary">
            Arquivos anexados ({items.length})
          </p>
          <div className="flex gap-1 rounded-md p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Exibir como lista"
              className={cn(
                "h-8 w-8 shrink-0",
                viewMode === "list" && "bg-muted",
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Exibir em grade"
              className={cn(
                "h-8 w-8 shrink-0",
                viewMode === "grid" && "bg-muted",
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ul
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col",
          )}
        >
          {items.map((row) =>
            viewMode === "grid" ? (
              <AttachmentGridCard
                key={row.id}
                row={row}
                canDelete={canDelete}
                onPreview={setPreview}
                onDownload={handleDownload}
                onDeleteClick={() => setDeleteId(row.id)}
              />
            ) : (
              <AttachmentListRow
                key={row.id}
                row={row}
                canDelete={canDelete}
                onPreview={setPreview}
                onDownload={handleDownload}
                onDeleteClick={() => setDeleteId(row.id)}
              />
            ),
          )}
        </ul>
      </div>

      <AttachmentPreviewDialog
        preview={preview}
        onClose={() => setPreview(null)}
      />

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
