"use client";

import { useCallback, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Download,
  Eye,
  FileText,
  Film,
  ImageIcon,
  LayoutGrid,
  List,
  Paperclip,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import type { CaseAttachmentListItem } from "@/services/db-api/case-attachments";
import { cn } from "@/lib/utils";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

async function downloadAttachment(
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

function isImageRow(row: CaseAttachmentListItem): boolean {
  return row.kind === "image" || row.mimeType.startsWith("image/");
}

function pickRowIcon(row: CaseAttachmentListItem) {
  if (isImageRow(row)) return ImageIcon;
  if (row.kind === "pdf" || row.mimeType === "application/pdf") return FileText;
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

type ViewMode = "grid" | "list";

export function AnexosList({
  items,
  isLoading = false,
  canDelete = false,
  onDelete,
  isDeleting = false,
}: AnexosListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
  } | null>(null);

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
            "grid gap-4",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1",
          )}
        >
          {items.map((row) => {
            const Icon = pickRowIcon(row);
            const image = isImageRow(row);

            return (
              <li
                key={row.id}
                className="flex flex-col overflow-hidden rounded-lg border border-border-divider bg-card shadow-sm"
              >
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
                          className="size-8 rounded-full border-0 bg-white shadow-sm hover:bg-white"
                          aria-label={`Visualizar ${row.filenameOriginal}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview({
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
                          className="size-8 rounded-full border-0 bg-white shadow-sm hover:bg-white"
                          aria-label={`Baixar ${row.filenameOriginal}`}
                          onClick={(e) => handleDownload(e, row)}
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
                        onClick={(e) => handleDownload(e, row)}
                      >
                        <Download className="size-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 text-destructive hover:text-destructive",
                        )}
                        aria-label={`Excluir ${row.filenameOriginal}`}
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog
        open={preview != null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 w-[min(96vw,1400px)] max-w-[min(96vw,1400px)] translate-x-[-50%] translate-y-[-50%] border-0 bg-transparent p-0 shadow-none outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            )}
          >
            {preview ? (
              <>
                <DialogTitle className="sr-only">{preview.name}</DialogTitle>
                <div className="relative flex max-h-[90vh] w-full flex-col items-center justify-center px-12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="max-h-[85vh] w-auto max-w-full object-contain"
                  />
                </div>
                <DialogPrimitive.Close
                  type="button"
                  className="absolute right-2 top-2 z-[60] rounded-full bg-black/40 p-2 text-white ring-offset-background transition-opacity hover:bg-black/60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                  <X className="size-5" />
                  <span className="sr-only">Fechar</span>
                </DialogPrimitive.Close>
              </>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

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
