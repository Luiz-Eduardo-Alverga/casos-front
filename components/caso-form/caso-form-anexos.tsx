"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  FileText,
  Film,
  ImageIcon,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { MAX_ATTACHMENTS_PER_CASE } from "@/lib/constants/case-attachments";
import { validateCaseAttachmentFile } from "@/services/db-api/case-attachments";
import toast from "react-hot-toast";

export interface CasoFormAnexosProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  /** Sem `Card` externo (útil dentro de outro card, ex.: aba de edição). */
  embedded?: boolean;
  /** Controle externo do modal (abertura de caso). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function fileIcon(file: File) {
  const t = file.type || "";
  if (t.startsWith("image/")) return ImageIcon;
  if (t === "application/pdf") return FileText;
  if (t.startsWith("video/")) return Film;
  return Paperclip;
}

function addFilesToList(
  current: File[],
  incoming: File[],
): { next: File[]; error?: string } {
  const next = [...current];
  for (const file of incoming) {
    if (next.length >= MAX_ATTACHMENTS_PER_CASE) {
      return {
        next,
        error: `No máximo ${MAX_ATTACHMENTS_PER_CASE} anexos por caso.`,
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

export function CasoFormAnexos({
  files,
  onFilesChange,
  disabled = false,
  embedded = false,
  open,
  onOpenChange,
}: CasoFormAnexosProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;

  const rbacReady = permissionsLoaded();
  const canCreate = !rbacReady || hasPermission("create-case-attachment");
  const canInteract = !disabled && canCreate;

  const setDialogOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const mergeIncoming = useCallback(
    (incoming: File[]) => {
      const { next, error } = addFilesToList(files, incoming);
      if (error) {
        toast.error(error);
        return;
      }
      if (next.length !== files.length) {
        onFilesChange(next);
      }
    },
    [files, onFilesChange],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    mergeIncoming(Array.from(list));
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || !canCreate) return;
    const dropped = Array.from(e.dataTransfer.files ?? []);
    if (!dropped.length) return;
    mergeIncoming(dropped);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!canInteract) return;
      // No modal, só captura paste quando o diálogo estiver aberto.
      if (!embedded && !dialogOpen) return;
      const ae = document.activeElement;
      if (
        ae instanceof HTMLInputElement ||
        ae instanceof HTMLTextAreaElement ||
        (ae instanceof HTMLElement && ae.isContentEditable)
      ) {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items?.length) return;
      const pasted: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f) pasted.push(f);
        }
      }
      if (pasted.length) {
        e.preventDefault();
        mergeIncoming(pasted);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [canInteract, embedded, dialogOpen, mergeIncoming]);

  if (!canCreate) {
    return null;
  }

  const inner = (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.mp4,.webm,.mov,image/*,application/pdf,video/*"
        disabled={disabled}
        onChange={onInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (canInteract) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (canInteract) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-sky-300 bg-slate-100/80",
          !canInteract && "opacity-50 pointer-events-none",
        )}
      >
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <Upload className="h-5 w-5 text-blue-500" />
        </div>
        <p className="mb-1 text-[12px] font-semibold text-black">
          Arraste arquivos aqui ou{" "}
          <button
            type="button"
            className="text-blue-500 underline-offset-2 hover:underline"
            disabled={!canInteract}
            onClick={() => inputRef.current?.click()}
          >
            escolha do computador
          </button>
        </p>
        <p className="text-[11px] text-slate-500">
          Você também pode colar captura de tela com Ctrl+V
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            PNG, JPG, WEBP (10MB)
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3 w-3" />
            PDF (25MB)
          </span>
          <span className="inline-flex items-center gap-1">
            <Film className="h-3 w-3" />
            Vídeos (100MB)
          </span>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-3 rounded-lg border border-border-divider bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Paperclip className="h-3.5 w-3.5 text-text-primary" />
          <p className="text-sm font-semibold text-text-primary">
            Adicionar novos anexos
          </p>
        </div>
        <p className="text-xs text-text-secondary">
          Imagens, PDF ou vídeo (até {MAX_ATTACHMENTS_PER_CASE} arquivos). Você
          também pode colar captura de tela com Ctrl+V (fora de campos de
          texto).
        </p>
        {inner}
        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((file, idx) => {
              const Icon = fileIcon(file);
              return (
                <li
                  key={`${file.name}-${file.size}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border-divider bg-white px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-text-secondary" />
                    <span className="truncate text-text-primary">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-text-secondary text-xs">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={disabled}
                    onClick={() => {
                      onFilesChange(files.filter((_, i) => i !== idx));
                    }}
                    aria-label={`Remover ${file.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-[760px] overflow-hidden p-0 gap-0">
        <DialogTitle className="sr-only">Gerenciar anexos</DialogTitle>
        <DialogDescription className="sr-only">
          Adicione, visualize e remova arquivos anexados antes de concluir a
          abertura do caso.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-border-divider bg-white px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50">
            <Paperclip className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-black">Gerenciar Anexos</p>
            <p className="text-[11px] text-slate-500">
              Imagens, PDF ou vídeo (até {MAX_ATTACHMENTS_PER_CASE} arquivos).
            </p>
          </div>
        </div>

        <div className="flex min-h-[460px] flex-col bg-white md:flex-row">
          <div className="flex-1 bg-slate-50 p-4">{inner}</div>

          <div className="flex w-full flex-col border-l border-border-divider bg-white md:w-[240px]">
            <div className="flex items-center justify-between border-b border-border-divider px-3 py-3">
              <p className="text-sm font-semibold text-black">Arquivos Anexados</p>
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold text-blue-900">
                {files.length}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {files.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nenhum arquivo selecionado ainda.
                </p>
              ) : (
                files.map((file, idx) => {
                  const Icon = fileIcon(file);
                  const isImage = file.type.startsWith("image/");
                  const imageUrl = isImage ? URL.createObjectURL(file) : null;
                  return (
                    <div
                      key={`${file.name}-${file.size}-${idx}`}
                      className="rounded border border-border-divider bg-white px-2 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded border border-border-divider bg-muted">
                          {isImage && imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Icon className="h-4 w-4 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium text-black">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            onFilesChange(files.filter((_, i) => i !== idx))
                          }
                          disabled={disabled}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-border-divider p-3">
              <Button
                type="button"
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setDialogOpen(false)}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Concluir Anexos
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
