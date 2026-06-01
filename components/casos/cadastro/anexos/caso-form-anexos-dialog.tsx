"use client";

import { Download, Ghost, Paperclip, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MAX_ATTACHMENTS_PER_CASE } from "@/lib/constants/case-attachments";
import { CasoFormAnexosDropzone } from "./caso-form-anexos-dropzone";
import { fileIcon } from "./utils";
import type { RefObject } from "react";
import { EmptyState } from "@/components/painel/empty-state";

export interface CasoFormAnexosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement>;
  dragOver: boolean;
  setDragOver: (value: boolean) => void;
  canInteract: boolean;
  disabled: boolean;
  files: File[];
  onRemoveAt: (index: number) => void;
  onAddFiles: (files: File[]) => void;
}

export function CasoFormAnexosDialog({
  open,
  onOpenChange,
  inputRef,
  dragOver,
  setDragOver,
  canInteract,
  disabled,
  files,
  onRemoveAt,
  onAddFiles,
}: CasoFormAnexosDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[960px] overflow-hidden p-0 gap-0 min-h-[600px]">
        <DialogTitle className="sr-only">Gerenciar anexos</DialogTitle>
        <DialogDescription className="sr-only">
          Adicione, visualize e remova arquivos anexados antes de concluir a
          abertura do caso.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-border-divider bg-white px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50">
            <Paperclip className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-black">Gerenciar Anexos</p>
            <p className="text-xs text-slate-500">
              Imagens, PDF ou vídeo (até {MAX_ATTACHMENTS_PER_CASE} arquivos).
            </p>
          </div>
        </div>

        <div className="flex min-h-[500px] flex-col bg-white md:flex-row">
          <div className="flex-1 bg-slate-50 p-4">
            <CasoFormAnexosDropzone
              inputRef={inputRef}
              dragOver={dragOver}
              setDragOver={setDragOver}
              canInteract={canInteract}
              disabled={disabled}
              onAddFiles={onAddFiles}
            />
          </div>

          <div className="flex w-full flex-col border-l justify-between border-border-divider bg-white md:w-[340px] ">
            <div className="flex items-center justify-between border-b border-border-divider px-3 py-3">
              <p className="text-sm font-semibold text-black">
                Arquivos Anexados
              </p>
              <span className="inline-flex h-6 min-w-4 items-center justify-center rounded-full bg-blue-100 px-2 text-xs font-bold text-blue-900">
                {files.length}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3 max-h-[390px]">
              {files.length === 0 ? (
                <EmptyState
                  icon={Ghost}
                  title="Nenhum arquivo selecionado ainda."
                  description="Adicione um arquivo para começar."
                />
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
                            // eslint-disable-next-line @next/next/no-img-element
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
                          <p className="truncate text-xs font-medium text-black">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemoveAt(idx)}
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
                onClick={() => onOpenChange(false)}
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
